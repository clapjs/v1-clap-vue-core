<template>
    <a-popover placement="bottomRight" trigger="click" overlayClassName="c-color-picker">
        <template slot="content">
            <sketch @input="handleInput" :value="value" :preset-colors="['#F5222D', '#FA541C', '#FAAD14', '#13C2C2', '#52C41A', '#1890FF', '#2F54EB', '#722ED1']"></sketch>
        </template>
        <a-avatar shape="square" :size="25" :style="{ backgroundColor: value }">
            <div style="margin: 4px" slot="icon">
                <c-icon type="background-color" :size="17" :strokeWidth="3" />
            </div>
        </a-avatar>
    </a-popover>
</template>

<script>
import { Sketch } from 'vue-color'
export default {
    name: 'CColorPicker',
    components: { Sketch },
    props: {
        // 当前颜色值
        /**
         * @model
         */
        value: {
            type: String,
            default: '#000000'
        },
        // 禁用状态
        /**
         * 禁用状态
         */
        disabled: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        handleInput(value) {
            /**
             * input 事件
             *
             * @event input
             * @type {object}
             */
            this.$emit('input', value.hex)
            /**
             * change 事件
             *
             * @event change
             * @type {object}
             */
            this.$emit('change', value.hex)
        }
    }
}
</script>

<style lang="less">
.c-color-picker {
    .ant-popover-inner-content {
        padding: 0;
    }
}
</style>
