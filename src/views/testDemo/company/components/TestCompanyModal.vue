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
            <h1>新增员工</h1>
            <form @submit.prevent="postData">
              <div>
                <label for="">员工id：</label>
                <input type="text" v-model="user.username">
              </div>
              <div>
                <label for="">入职时间：</label>
                <input type="date" v-model="user.takingdate">
              </div>
              <div>
                <label for="">入职部门：</label>
                <input type="text" v-model="user.department">
              </div>
              <button @click="handleClose(true)">Confirm</button>
              <button @click="handleClose(false)">Cancel</button>
            </form>

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
          :toolbar="true"
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
    import ruleForm from "@/views/demo/form/RuleForm.vue";
    import {rules} from "@/utils/helper/validator";
    import {defHttp} from "@/utils/http/axios";


    const dialogVisible = ref(false);
    const message = ref("Message");
    const user = ref({
      username: "",
      takingdate: "",
      department:""
    });

    let companyId= "";

    // Emits声明
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
        console.log("The data is");
        console.log(data.record.id);
        companyId = data.record.id;
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
        console.log(user.value.username);
        console.log(companyId);
        console.log(user.value.takingdate);
        let url = "/company/testCompany/addOneEmployee";
        let params = {
          id:companyId,
          employeeId:user.value.username,
          takingTime:user.value.takingdate,
          partment:user.value.department
        };
        console.log(params);
        defHttp.post({url: url, params});
        dialogVisible.value = false;
      } else {
        console.log(user);
        // Close the dialog without performing any action
        dialogVisible.value = false;
      }
    };

    const postData = ()=>{
      console.log(message);
    };



    async function reset(){
      await resetFields();
      activeKey.value = 'testCompany';
      testCompanyEmployeeTable.dataSource = [];
    }
    function classifyIntoFormData(allValues) {
      console.log("classifyIntoFormData Method")
      console.log(allValues)
      console.log("----------------------")
         let main = Object.assign({}, allValues.formValue)
         return {
           ...main, // 展开
           testCompanyEmployeeList: allValues.tablesValue[0].tableData,
         }
       }
    //表单提交事件
    async function requestAddOrEdit(values) {
      console.log("requestAddOrEdit Method")
      console.log(values)
      console.log("----------------------")
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
/* 样式按钮 */
button {
  background-color: #007BFF;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

/* 自定义对话框样式 */
.custom-dialog {
  background-color: #fff;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-radius: 5px;
  max-width: 400px;
  margin: 0 auto;
}

.custom-dialog h1 {
  font-size: 20px;
  margin-bottom: 20px;
}

.custom-dialog label {
  font-weight: bold;
}

.custom-dialog input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.custom-dialog button {
  background-color: #007BFF;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  margin-right: 10px;
  cursor: pointer;
}

.custom-dialog button:last-child {
  margin-right: 0;
}

.custom-dialog button:hover {
  background-color: #0056b3;
}

</style>
