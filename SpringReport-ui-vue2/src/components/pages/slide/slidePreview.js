/*
 * @Description: luckysheetreport预览页面js
 * @Version: 1.0
 * @Autor: caiyang
 * @Date: 2022-02-08 07:56:31
 * @LastEditors: caiyang caiyang90@163.com
 * @LastEditTime: 2022-08-23 16:40:43
 */

export default {
    components:{
    },
    data() {
        return{
            showReportSql:false,
            reportSqls:{},
            reportDialogVisiable:false,
            reportForm:[],
            showReportForm:false,
            tplName:"",
            loadingText:"",
            loading:false,
            searchData:{
                params:[],
            },//参数
            showSearch:true,//是否隐藏查询条件
            activitiName:"",
            apiHeaders:[],
            pptSrc:""
        }
    },
    mounted(){
        this.getReportParam();
     },
    methods:{
        //获取报表参数
        getReportParam(){
            let tplId = this.$route.query.tplId;
            let urlParamsLength = 0;
            if(this.$route.query)
            {
                let urlParams = { ...this.$route.query}
                delete urlParams['tplId']
                delete urlParams['token']
                urlParamsLength = Object.keys(urlParams).length
            }
            let obj = {
                url:this.apis.previewReport.getPreviewReportParamApi,
                params:{tplId:tplId,reportType:3},
            }
            let headers = {};
            if(this.isShare == 1)
            {
                headers.shareCode = this.shareCode;
                headers.shareUser = this.shareUser;
                obj.url = this.apis.previewReport.getSharePreviewReportParamApi
            }
            this.searchHandle=[
                {label:'查询',icon:'el-icon-search',type:'primary',handle:()=>this.getReportData(),size:'mini'},
                {label:'重置',icon:'el-icon-refresh-left',type:'warning',handle:()=>this.resetSearch(),size:'mini'},
                {label:'导出word',icon:'iconfont icon-daochuword',type:'success',handle:()=>this.downLoadDoc(1),size:'mini'},
            ];
            var that = this;
            this.commonUtil.doPost(obj,headers) .then(response=>{
                if (response.code == "200")
                {
                    let result = response.responseData.params;
                    this.searchData.params = [];
                    that.apiHeaders = response.responseData.apiHeaders;
                    for(let i = 0;i<result.length;i++)
                    {
                        var dataSet = {};
                        dataSet.datasetId = result[i].datasetId;
                        dataSet.datasetName = result[i].datasetName;
                        dataSet.datasourceId = result[i].datasourceId;
                        dataSet.params = [];
                        let tempParams = {};
                        for(let m = 0;m<result[i].params.length;m++){
                            var param = {};
                            if(result[i].params[m].paramType == "mutiselect" || result[i].params[m].paramType == "multiTreeSelect")
                            {
                                var data = new Array();
                                if(this.isDrillBack == 1)
                                {
                                    if(this.parentParams && this.parentParams[dataSet.datasetId] && this.parentParams[dataSet.datasetId][result[i].params[m].paramCode])
                                    {
                                        data =  this.parentParams[dataSet.datasetId][result[i].params[m].paramCode];
                                    }
                                }else if(this.isDrill == 1 && this.isDrillBack == 2 && this.drillParams)
                                {
                                    if(this.drillParams[result[i].params[m].paramCode])
                                    {
                                        if(this.drillParams[result[i].params[m].paramCode] instanceof Array)
                                        {
                                            data = this.drillParams[result[i].params[m].paramCode]
                                        }else{
                                            data.push(this.drillParams[result[i].params[m].paramCode]);
                                        }
                                    }else{
                                        if(result[i].params[m].paramDefault != null && result[i].params[m].paramDefault != "")
                                        {
                                            data = result[i].params[m].paramDefault.split(",");
                                        } 
                                    }
                                }else{
                                    if(this.$route.query[result[i].params[m].paramCode])
                                    {
                                        data.push(this.$route.query[result[i].params[m].paramCode]);
                                    }else{
                                        if(result[i].params[m].paramDefault != null && result[i].params[m].paramDefault != "")
                                        {
                                            data = result[i].params[m].paramDefault.split(",");
                                        }
                                    }
                                }
                                param[result[i].params[m].paramCode] = data;
                            }else{
                                if(this.$route.query[result[i].params[m].paramCode])
                                    {
                                        param[result[i].params[m].paramCode]=this.$route.query[result[i].params[m].paramCode]
                                        if(result[i].params[m].paramType == "select")
                                        {
                                            let relyOnParams = result[i].params[m].relyOnParams;
                                            let isRelyOnParams = result[i].params[m].isRelyOnParams;
                                            if(isRelyOnParams == 1 && (this.$route.query[relyOnParams] || tempParams[relyOnParams])){
                                                that.getRelyOnParamys(result[i].params[m],this.$route.query[relyOnParams]?this.$route.query[relyOnParams]:tempParams[relyOnParams]);
                                            }
                                        }
                                    }else{
                                        if(result[i].params[m].paramDefault != null && result[i].params[m].paramDefault != "")
                                        {
                                            param[result[i].params[m].paramCode] = result[i].params[m].paramDefault
                                        }else{
                                            param[result[i].params[m].paramCode] = "";
                                        }
                                        if(result[i].params[m].paramType == "select")
                                        {
                                            let relyOnParams = result[i].params[m].relyOnParams;
                                            let isRelyOnParams = result[i].params[m].isRelyOnParams;
                                            if(isRelyOnParams == 1 && (this.$route.query[relyOnParams] || tempParams[relyOnParams])){
                                                that.getRelyOnParamys(result[i].params[m],this.$route.query[relyOnParams]?this.$route.query[relyOnParams]:tempParams[relyOnParams]);
                                            }
                                        }
                                    }
                            }
                            param.paramCode =  result[i].params[m].paramCode;
                            param.dateFormat = result[i].params[m].dateFormat;
                            param.paramHidden = result[i].params[m].paramHidden;
                            param.paramDefault = result[i].params[m].paramDefault;
                            param.paramType = result[i].params[m].paramType;
                            param.checkStrictly = result[i].params[m].checkStrictly;
                            if(!tempParams[result[i].params[m].paramCode]){
                                tempParams[result[i].params[m].paramCode] = result[i].params[m].paramDefault;
                            }
                            dataSet.params.push(param);
                        }
                        that.searchData.params.push(dataSet);
                    }
                    that.reportForm = result;
                    that.showReportForm = true;
                    that.$nextTick(() => {
                        this.pptSrc = `${process.env.VUE_APP_BASE_PPT_URL}`
                        const iframe = document.querySelector('#pptIframe');
                        const tplId = that.$route.query.tplId// reportTplId
                        let apiHeaders = {};
                        if(that.apiHeaders && that.apiHeaders.length > 0){
                            for (let index = 0; index < that.apiHeaders.length; index++) {
                                const element = that.apiHeaders[index];
                                if(that.$route.query[element]){
                                    apiHeaders[element] = that.$route.query[element];
                                }
                            }
                        }
                        iframe.onload = function(){
                            var obj = {
                                tplId:tplId,
                                token:localStorage.getItem("token"),
                                designMode:"2",
                                searchData:that.searchData.params,
                                apiHeaders:apiHeaders
                            }
                            iframe.contentWindow.postMessage(obj, '*')
                        }
                    });
                }
            });
        },
        getRelyOnParamys(item,relyOnValue){
            var params = {
                selectContent: item.selectContent,
                datasourceId: item.datasourceId,
                params: {},
              };
              params.params[item.relyOnParams] = relyOnValue;
              var obj = {
                url: "/api/reportTplDataset/getRelyOnData",
                params: params,
              };
              this.commonUtil.doPost(obj).then((response) => {
                if (response.code == "200") {
                  item.selectData = response.responseData;
                }
              });
        },
        resetSearch:function(){
            this.getReportParam();
        },
        closeLoading(){
            this.loading = false;
        },
        showSearchClick(){
            this.showSearch = true;
        },
        showSql(){
            this.reportDialogVisiable = true;
        },
        rendered(){
            console.log("渲染完成")
        },
        downLoadDoc(type){
            window.open(this.docxUrl);
        }
    }
}
