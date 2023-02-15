<template>
    <a-modal v-model="visible" :footer="null" :width="1024" :mask-closable="false" :closable="false" :body-style="{padding:0}">
        <a-card title="已加入组织" :bordered="false" :extra="user&&user.userName+',您好，欢迎使用'">
            <a-row v-if="organUsers.length>0" type="flex" justify="start">
                <template v-for="organUser of organUsers">
                    <a-col span="4" style="padding: 0 10px 10px 0;min-width: 150px" :key="organUser._id">
                        <a title="点击进入系统" style="color: #000000;" @click="doAction('organ',organUser)">
                            <div style="text-align: center">
                                <a-row style="margin-bottom: 12px">
                                    <a-avatar shape="square" :size="80" :style="{backgroundColor:'#259ebf'}">
                                        <div style="margin: 12px;">
                                            <c-icon type="building-one" :size="56" fill="#fff" :strokeWidth="3"></c-icon>
                                        </div>
                                    </a-avatar>
                                </a-row>
                                <a-row class="text">
                                    <a-tooltip placement="bottom" :title="organUser.idOrgan.organName">
                                        {{ organUser.idOrgan.organName }}
                                    </a-tooltip>
                                </a-row>
                                <span style="color: #2D8cF0;font-size: 10px">{{ '[' + organUser.userType + ']' }}</span>
                            </div>
                        </a>
                    </a-col>
                </template>
            </a-row>
            <a-empty description="暂未加入任何企业" v-else/>
        </a-card>
        <a-card title="更多操作" :bordered="false">
            <a-row>
                <a-col v-for="action of actions" :key="action.event" span="4" style="padding: 0 10px 10px 0;min-width: 150px">
                    <a @click="doAction(action.event)" style="color: #000000;">
                        <div style="text-align: center">
                            <a-row style="margin-bottom: 24px">
                                <a-avatar shape="square" :size="80" :icon="action.icon" :style="{backgroundColor:action.color}"/>
                            </a-row>
                            <a-row>{{action.name}}</a-row>
                        </div>
                    </a>
                </a-col>
            </a-row>
        </a-card>
    </a-modal>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
export default {
    name: "CLoginOrgan",
    props:{
        visible:{
            type:Boolean,
            default:false
        },
        organUsers:{
            type:Array,
            default(){
                return []
            }
        },
        actions:{
            type:Array,
            default(){
                return [
                    {
                        event:'creatOrgan',
                        color:'#259ebf',
                        icon:'team',
                        name:'新建组织'
                    },
                    {
                        event:'logout',
                        color:'#f5222d',
                        icon:'poweroff',
                        name:'退出系统'
                    }
                ]
            }
        }
    },
    data(){
        return {

        }
    },
    computed: {
        ...mapGetters(['user']),
    },
    methods:{
        cancel(){
            this.$emit('update:visible', false);
        },
        async doAction(event,extra) {
            this.$emit('update:visible', false);
            this.$emit('doAction', event,extra);
        },
    }
}
</script>

<style scoped>

</style>