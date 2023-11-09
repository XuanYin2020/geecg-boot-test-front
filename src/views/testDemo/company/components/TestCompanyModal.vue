<template>
  <BasicModal ref="modalRef" destroyOnClose wrapClassName="j-cgform-tab-modal" v-bind="$attrs"
              @register="registerModal" :width="800" @ok="handleSubmit" >
  <!-- 子表单区域 -->
    <a-tabs v-model:activeKey="activeKey" animated @change="handleChangeTabs">
     <!--主表区域 -->
     <a-tab-pane tab="公司信息" :key="refKeys[0]" :forceRender="true" :style="tabsStyle">
       <BasicForm @register="registerForm" ref="formRef"/>
     </a-tab-pane>
     <!--子表单区域 -->
      <a-tab-pane tab="入职的员工" key="testCompanyEmployee" :forceRender="true" :style="tabsStyle">
        <div>
          <button @click="dialogVisible = true">新增</button>
          <div v-if="dialogVisible" class="custom-dialog">
            <p>Are you sure you want to close this dialog?</p>
            <button @click="handleClose(true)">Confirm</button>
            <button @click="handleClose(false)">Cancel</button>
          </div>
        </div>
        <JVxeTable
          keep-source
          resizable
          ref="testCompanyEmployee"
          :loading="testCompanyEmployeeTable.loading"
          :columns="testCompanyEmployeeTable.columns"
          :dataSource="testCompanyEmployeeTable.dataSource"
          :height="340"
          :disabled="formDisabled"
          :rowNumber="true"
          :rowSelection="true"
          :toolbar="false"
          />
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
</template>
<script lang="ts" setup>
    import {ref, computed, unref,reactive} from 'vue';
    import {BasicModal, useModalInner} from '/@/components/Modal';
    import {BasicForm, useForm} from '/@/components/Form/index';
    import { JVxeTable } from '/@/components/jeecg/JVxeTable'
    import { useJvxeMethod } from '/@/hooks/system/useJvxeMethods.ts'
    import {formSchema,testCompanyEmployeeColumns} from '../TestCompany.data';
    import {saveOrUpdate,testCompanyEmployeeList} from '../TestCompany.api';
    import { VALIDATE_FAILED } from '/@/utils/common/vxeUtils'
    // Emits声明

    const dialogVisible = ref(false);

    const emit = defineEmits(['register','success']);
    const isUpdate = ref(true);
    const formDisabled = ref(false);
    const modalRef = ref();
    const refKeys = ref(['testCompany','testCompanyEmployee', ]);
    const activeKey = ref('testCompany');
    const testCompanyEmployee = ref();
    const tableRefs = {testCompanyEmployee, };
    const testCompanyEmployeeTable = reactive({//表头的信息
          loading: false,
          dataSource: [],
          columns:testCompanyEmployeeColumns
    })
    //表单配置
    const [registerForm, {setProps,resetFields, setFieldsValue, validate}] = useForm({
        //labelWidth: 150,
        schemas: formSchema,
        showActionButtonGroup: false,
        baseColProps: {span: 24}
    });
    /**
     * useModalInner() 用于独立的 Modal 内部调用
     */
     //表单赋值
    const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
        //重置表单
        await reset();
        setModalProps({confirmLoading: false,showCancelBtn:data?.showFooter,showOkBtn:data?.showFooter});
        isUpdate.value = !!data?.isUpdate;
        formDisabled.value = !data?.showFooter;
        if (unref(isUpdate)) {
            //表单赋值
            await setFieldsValue({
                ...data.record,
            });
            //载入从后端请求来的，table的数据
             requestSubTableData(testCompanyEmployeeList, {id:data?.record?.id}, testCompanyEmployeeTable)
        }
        // 隐藏底部时禁用整个表单
       setProps({ disabled: !data?.showFooter })
    });
    //方法配置
    const [handleChangeTabs,handleSubmit,requestSubTableData,formRef] = useJvxeMethod(requestAddOrEdit,classifyIntoFormData,tableRefs,activeKey,refKeys);
    // 弹窗tabs滚动区域的高度
    const tabsStyle = computed(() => {
      let height: Nullable<string> = null
      let minHeight = '100px'
      let maxHeight: Nullable<string> = '500px'
      // 弹窗wrapper
      let modalWrapperRef = modalRef.value?.modalWrapperRef
      if (modalWrapperRef) {
        if (modalWrapperRef.fullScreen) {
          height = 'calc(' + modalWrapperRef.spinStyle.height + ' - 50px)';
          maxHeight = null
        }
      }
      let overflow = 'auto';
      return {height, minHeight, maxHeight, overflow};
    })

    const handleClose = (confirmed) => {
      if (confirmed) {
        // Handle the confirmation logic here
        // For example, close the dialog and perform an action
        dialogVisible.value = false;
      } else {
        // Close the dialog without performing any action
        dialogVisible.value = false;
      }
    };





    async function reset(){
      await resetFields();
      activeKey.value = 'testCompany';
      testCompanyEmployeeTable.dataSource = [];
    }
    function classifyIntoFormData(allValues) {
         let main = Object.assign({}, allValues.formValue)
         return {
           ...main, // 展开
           testCompanyEmployeeList: allValues.tablesValue[0].tableData,
         }
       }
    //表单提交事件
    async function requestAddOrEdit(values) {
        try {
            setModalProps({confirmLoading: true});
            //提交表单
            await saveOrUpdate(values, isUpdate.value);
            //关闭弹窗
            closeModal();
            //刷新列表
            emit('success');
        } finally {
            setModalProps({confirmLoading: false});
        }
    }
</script>

<style lang="less" scoped>
/** 时间和数字输入框样式 */
    :deep(.ant-input-number){
        width: 100%
    }

    :deep(.ant-calendar-picker){
        width: 100%
    }
</style>

<style lang="less">
// Online表单Tab风格专属样式
.j-cgform-tab-modal {
  .ant-modal-header {
    padding-top: 8px;
    padding-bottom: 8px;
    border-bottom: none !important;
  }

  .ant-modal .ant-modal-body > .scrollbar,
  .ant-tabs-nav .ant-tabs-tab {
    padding-top: 0;
  }

  .ant-tabs-top-bar {
    width: calc(100% - 55px);
    position: relative;
    left: -14px;
  }

  .ant-tabs .ant-tabs-top-content > .ant-tabs-tabpane {
    overflow: hidden auto;
  }
}
.custom-dialog {
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 20px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}
</style>
