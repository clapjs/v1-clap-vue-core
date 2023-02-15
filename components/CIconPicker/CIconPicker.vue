<template>
    <div>
        <a-space>
            <a-avatar shape="square" :size="25" :style="{backgroundColor:bgColor}">
                <div style="margin: 4px" slot="icon">
                    <c-icon :type="value" :size="17" :strokeWidth="3" />
                </div>
            </a-avatar>
            <a-button icon="select" @click="visible=true">点击选择</a-button>
        </a-space>
        <a-modal title="选择图标" v-model="visible" :maskClosable="false" destroyOnClose :width="768" @ok="handleInput" @cancel="visible=false">
            <a-input-search style="margin-bottom: 12px" placeholder="输入关键字" enter-button @search="onSearch" allowClear/>
            <div id="content" style="max-height: 350px;overflow: auto;">
                <a-radio-group :value="icon" @change="onChange">
                    <div v-for="type of IconListFilter.length<=0?types:[types[0]]" :key="type.type" :id="type.type">
                        <a-divider>{{IconListFilter.length<=0?type.name:'检索到'+IconListFilter.length+'条记录'}}</a-divider>
                        <div v-if="rendering[type.type]">
                            <a-radio :value="icon.icon" v-for="icon of IconListFilter.length<=0?IconList.filter(item=>item.type===type.type):IconListFilter" :key="icon.icon" >
                                <a-avatar shape="square" :size="50" :style="{backgroundColor:bgColor}" style="margin: 0 12px 12px 12px">
                                    <div style="margin:8px" slot="icon">
                                        <c-icon :type="icon.icon"  :size="34" :stroke-width="3"/>
                                    </div>
                                </a-avatar>
                            </a-radio>
                        </div>
                    </div>
                </a-radio-group>
            </div>
        </a-modal>
    </div>
</template>

<script>
    import IconList from "./iconPark";
    export default {
        name: "CIconPicker",
        props:{
            value:{
                type:String,
                default:'material'
            },
            bgColor:{
                type:String,
                default:'#1890FF'
            }
        },
        watch:{
            visible(val){
                if(val){
                    this.$nextTick(() => {
                        document.getElementById('content').addEventListener('scroll', this.scroll)
                    });
                }
            }
        },
        data(){
            return {
                visible:false,
                types: [{name:"基础",type:"basic",height:2491},{name:"办公",type:"office",height:1431},{name:"编辑",type:"edit",height:4293},{name:"表情",type:"emoji",height:583},{name:"餐饮",type:"food",height:1643},{name:"操作",type:"operate",height:901},{name:"抽象",type:"abstract",height:1643},{name:"儿童",type:"child",height:689},{name:"方向",type:"direction",height:1749},{name:"服饰",type:"dress",height:1007},{name:"符号",type:"symbol",height:477},{name:"工业",type:"factory",height:371},{name:"家居",type:"furniture",height:371},{name:"建筑",type:"build",height:1007},{name:"交流",type:"communication",height:371},{name:"连接",type:"connect",height:795},{name:"旅行",type:"travel",height:795},{name:"美妆",type:"beauty",height:689},{name:"品牌",type:"brand",height:1113},{name:"钱财",type:"money",height:795},{name:"人群",type:"people",height:795},{name:"声音",type:"sound",height:689},{name:"时间",type:"time",height:265},{name:"手势",type:"gesture",height:1007},{name:"书籍",type:"book",height:901},{name:"数据库",type:"database",height:371},{name:"天气",type:"weather",height:265},{name:"图表",type:"chart",height:901},{name:"图形",type:"graph",height:371},{name:"医疗",type:"hospital",height:689},{name:"硬件",type:"hardware",height:2385},{name:"运动",type:"sport",height:1007},{name:"其他",type:"other",height:2703}],
                rendering: { basic: true, office: false, edit: false, emoji: false, food: false, operate: false, abstract: false, child: false, direction: false, dress: false, symbol: false, factory: false, furniture: false, build: false, communication: false, connect: false, travel: false, beauty: false, brand: false, money: false, people: false, sound: false, time: false, gesture: false, book: false, database: false, weather: false, chart: false, graph: false, hospital: false, hardware: false, sport: false, other: false },
                IconList,
                IconListFilter:[],
                colors:['#722ED1','#2F54EB','#1890FF','#52C41A','#13C2C2','#FAAD14','#FA541C','#F5222D'],
                icon:'',
            }
        },
        mounted() {
            this.IconListFilter=[];
        },
        methods:{
            setCurrentValue(value) {
                this.icon=value;
            },
            scroll() {
                if(!this.IconListFilter[0]){
                    for (let type of this.types) {
                        this.rendering[type.type] =this.rendering[type.type]?this.rendering[type.type]:(document.getElementById(type.type).getBoundingClientRect().top-document.getElementById('content').getBoundingClientRect().top) <= 350;
                    }
                }
            },
            onSearch(keyword){
                this.IconListFilter=keyword?this.IconList.filter(item=>{
                    return (item.name+item.icon).indexOf(keyword)>-1
                }):[]
                if(this.IconListFilter.length===0){
                    this.$message.error('没有匹配的数据，请重新输入关键字！')
                }
            },
            onChange(e){
                this.icon=e.target.value;
                this.$emit('change',e.target.value)
            },
            handleInput(){
                this.$emit('input',this.icon);
                this.visible=false;
            }
        }
    }
</script>

<style scoped>

</style>