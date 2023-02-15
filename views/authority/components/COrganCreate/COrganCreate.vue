<template>
    <a-modal v-model="visible" title="组织创建" centered :mask-closable="false" :closable="false" dialogClass="noDrag" @ok="doOrganCreate">
        <a-form-model ref="form" labelAlign="left" :model="form" :rules="rule" :label-col="{span: 4}" :wrapper-col="{span: 20}">
            <a-form-model-item label="组织名称" prop="organName">
                <a-input v-model="form.organName"/>
            </a-form-model-item>
        </a-form-model>
    </a-modal>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
export default {
    name: "CRegisterOrgan",
    props:{
        visible:{
            type:Boolean,
            default:false
        }
    },
    data(){
        const validateOrganNamePass = async (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入组织名称！'));
            } else {
                const count = await this.$clap.model('org_organ').get({params: {filter: {organName: value}}}).then(el => el.count)
                if (count) {
                    callback(new Error('该组织名称已存在!'));
                } else {
                    callback();
                }
            }
        };
        return {
            form: {
                organName: '',
            },
            rule: {
                organName: [{required: true, validator: validateOrganNamePass, trigger: 'change'}],
            },
        }
    },
    computed: {
        ...mapGetters(['user']),
    },
    methods:{
        cancel(){
            this.$emit('update:visible', false);
        },
        async doOrganCreate() {
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    const result = await this.$clap.http.post(this.$clap.config.url.registerOrgan, {
                        ...this.form,
                        idUser: this.user._id
                    });
                    if (result.data.error.code === '0') {
                        this.$emit('update:visible', false);
                        this.$emit('done');
                    }
                }
            });
        },
    }
}
</script>

<style scoped>

</style>