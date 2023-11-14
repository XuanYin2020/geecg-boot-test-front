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
          <button @click="openPopup">新增</button>
          <!-- 自定义弹窗组件 -->
          <BasicModal  @register="registerModal2" title="新增员工"
                       :showCancelBtn="false" :showOkBtn="false" >
            <!-- 自定义表单：新增一个员工 -->
            <BasicForm @register="registerForm2" v-if="addNew" @submit="submitUpdate" >
              <template #formFooter>
                <div style="margin: 0 auto">
                  <a-button type="primary" @click="submitUpdate" class="mr-2"> 保存</a-button>
                  <a-button type="error" @click="resetUpdate" class="mr-2"> 重置 </a-button>
                </div>
              </template>
            </BasicForm>
            <!--编辑表单-->
            <BasicForm @register="registerForm3" v-if="editOne" @submit="submitUpdate" >
              <template #formFooter>
                <div style="margin: 0 auto">
                  <a-button type="primary" @click="submitUpdate" class="mr-2"> 保存2</a-button>
                  <a-button type="error" @click="resetUpdate" class="mr-2"> 重置2 </a-button>
                </div>
              </template>
            </BasicForm>
          </BasicModal>
        </div>

        <!--定义表格-->
        <BasicTable @register="registerTable">
          <!--操作栏-->
          <template #action="{ record }">
            <TableAction :actions="getTableAction(record)" />
          </template>
        </BasicTable>
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
</template>
<script lang="ts" setup>

    import {ref, computed, unref,reactive} from 'vue';
    import {BasicModal,useModal , useModalInner} from '/@/components/Modal';
    import {BasicForm, useForm,FormSchema} from '/@/components/Form/index';
    import { JVxeTable } from '/@/components/jeecg/JVxeTable'
    import { useJvxeMethod } from '/@/hooks/system/useJvxeMethods.ts'
    import {formSchema,testCompanyEmployeeColumns} from '../TestCompany.data';
    import {saveOrUpdate,testCompanyEmployeeList} from '../TestCompany.api';
    import { VALIDATE_FAILED } from '/@/utils/common/vxeUtils'
    import ruleForm from "@/views/demo/form/RuleForm.vue";
    import {rules} from "@/utils/helper/validator";
    import {defHttp} from "@/utils/http/axios";
    import dayjs from "dayjs";
    import {array} from "vue-types";
    import { ActionItem, BasicColumn, BasicTable, TableAction } from '/@/components/Table';
    import { useListPage } from '/@/hooks/system/useListPage';


    //定义表格列字段
    const columns: BasicColumn[] = [
      {
        title: 'ID',
        dataIndex: 'employeeId',
        key: 'employeeId',
      },
      {
        title: '入职日期',
        dataIndex: 'takingTime',
        key: 'takingTime',
      },
      {
        title: '入职部门',
        dataIndex: 'partment',
        key: 'partment',
      },
    ];

    //ajax请求api接口
    const demoListApi = (params) => {
      params.id = companyId;
      let ans = defHttp.get({ url: '/company/testCompany/queryTestCompanyEmployeeByMainId',params });
      console.log("The ans is :",ans);
      return ans;
    };

    /** useListPage 是整个框架的核心用于表格渲染，里边封装了很多公共方法；
     * 平台通过此封装，简化了代码，支持自定义扩展*/
    // 通过hook useListPage渲染表格（设置dataSource、columns、actionColumn等参数）
    const { tableContext } = useListPage({
        designScope: 'basic-table-demo',
        tableProps: {
          title: '用户列表',
          api:demoListApi,
          columns: columns,
          size: 'small',
          actionColumn: {
            width: 120,
          },
        },
      });
    // BasicTable绑定注册
    const [registerTable] = tableContext;
    /**
     * 操作栏
     */
    function getTableAction(record): ActionItem[] {
      return [
        {
          label: '编辑',
          onClick: handleEdit.bind(null, record),
        },
        {
          label: '删除',
          onClick: handleDelete.bind(null, record),
        },
      ];
    }

    function handleEdit(record) {
      console.log("handleEdit:",record );
      editOne = true
      addNew = false
      openModal(true, {
        record,
        isUpdate: true,
        showFooter: true,
      });
    }


    function handleDelete(record){
      console.log('handleDelete:', { record })
      let params = {
        id:record.id,
      };
      console.log('handleDelete:', { params })
      let url = "/company/testCompany/deleteOneEmployee";
      defHttp.post({url: url, params});
      closeModal();
    }

    const dialogVisible = ref(false);
    const message = ref("Message");
    const user = ref({
      username: "",
      takingdate: "",
      department:""
    });

    let companyId= "";
    let addNew=false;
    let editOne=false;

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
    /**自定义表单字段**/
    //新增表单
    const formSchemas: FormSchema[] = [
      {
        label: '员工姓名',
        field: 'name',
        component: 'Input',
      },
      {
        label: '员工Id',
        field: 'Id',
        component: 'Input',
      },
      {
        label: '入职部门',
        field: 'department',
        component: 'Input',
      },
      {
        label: '头像上传',
        field: 'uploadImage',
        component: 'JImageUpload',
        componentProps: {
          //按钮显示文字
          text:'图片上传',
          //支持两种基本样式picture和picture-card
          listType:'picture-card',
          //用于控制文件上传的业务路径,默认temp
          bizPath:'temp',
          //是否禁用
          disabled:false,
          //最大上传数量
          fileMax:1,
        },
      },
      {
        label: '性别',
        field: 'sex',
        component: 'Select',
        //填写组件Select的属性
        componentProps: {
          options: [
            { label: '男', value: 1 },
            { label: '女', value: 2 },
            { label: '未知', value: 3 },
          ],
        },
        //默认值
        defaultValue: 3,
      },
      {
        label: '入职时间',
        field: 'dateSelect',
        component: 'DatePicker',
        componentProps: {
          //日期格式化，页面上显示的值
          format:'YYYY-MM-DD',
          //返回值格式化（绑定值的格式）
          valueFormat:'YYYY-MM-DD',
          //是否显示今天按钮
          showToday:true,
        },
      },
      {
        label: '备注',
        field: 'tinymce',
        component: 'JEditor',
        defaultValue: '备注信息',
      },
    ];
    //编辑表单
    const formSchemas3: FormSchema[] = [
     {
        label: '员工姓名',
        field: 'name',
        component: 'Input',
      },
      {
        label: '员工Id',
        field: 'Id',
        component: 'Input',
      },
      {
        label: '入职部门',
        field: 'department',
        component: 'Input',
      },
      {
        label: '头像上传',
        field: 'uploadImage',
        component: 'JImageUpload',
        componentProps: {
          //按钮显示文字
          text:'图片上传',
          //支持两种基本样式picture和picture-card
          listType:'picture-card',
          //用于控制文件上传的业务路径,默认temp
          bizPath:'temp',
          //是否禁用
          disabled:false,
          //最大上传数量
          fileMax:1,
        },
      },
      {
        label: '性别',
        field: 'sex',
        component: 'Select',
        //填写组件Select的属性
        componentProps: {
          options: [
            { label: '男', value: 1 },
            { label: '女', value: 2 },
            { label: '未知', value: 3 },
          ],
        },
        //默认值
        defaultValue: 3,
      },
      {
        label: '入职时间',
        field: 'dateSelect',
        component: 'DatePicker',
        componentProps: {
          //日期格式化，页面上显示的值
          format:'YYYY-MM-DD',
          //返回值格式化（绑定值的格式）
          valueFormat:'YYYY-MM-DD',
          //是否显示今天按钮
          showToday:true,
        },
      },
      {
        label: '备注',
        field: 'tinymce',
        component: 'JEditor',
        defaultValue: '备注信息',
      },
    ];

    /**
     * BasicModal绑定注册;
     */
    const [registerModal2, { openModal }] = useModal();

    /**
     * registerForm2，BasicForm绑定注册;
     * 用于新增员工
     */
    const [registerForm2,{getFieldsValue}] = useForm({
      //注册表单列
      schemas: formSchemas,
      showResetButton: true, //是否显示重置按钮
      resetButtonOptions:{text:"重置2", preIcon: '' },
      submitButtonOptions: { text: '保存', preIcon: '' },
      actionColOptions: { span: 17 },
      //隐藏操作按钮
      showActionButtonGroup: false,
    });

    /**
     * registerForm3，BasicForm绑定注册;
     * 用于编辑员工
     */
    const [registerForm3,{updateSchema, resetSchema}] = useForm({
      //注册表单列
      schemas: formSchemas3,
      submitButtonOptions: { text: '保存', preIcon: '' },
      actionColOptions: { span: 17 },
      //隐藏操作按钮
      showActionButtonGroup: false,
    });

    /**
     * BasicForm绑定注册;表单配置
     *  useForm 是整个框架的核心用于表单渲染，里边封装了很多公共方法;
     */
    const [registerForm, {setProps,resetFields, setFieldsValue, validate}] = useForm({
        //labelWidth: 150,
        schemas: formSchema,//注册表单列
        showActionButtonGroup: false,
        baseColProps: {span: 24}
    });

    /**
     * 打开弹窗
     */
    async function openPopup() {
      addNew = true
      editOne = false
      //详见 BasicModal模块
      openModal(true, {});// data: 传递到子组件的数据
    }
    /**
     * 编辑一个employee
     */
    async function editEmployee() {
      //详见 BasicModal模块
      openModal(true, {});// data: 传递到子组件的数据
    }
    /** 删除员工信息：获取row, 删除row*/
    function deleteData() {
      const values = testCompanyEmployee.value!.getSelectionData()
      console.log('删除row---获取值:', { values })
      if(values.length == 0 ){
        console.log('values are not defined')
        alert("请选择待删除的员工信息")
      }else{
        console.log('获取值:',  values[0] )
        let url = "/company/testCompany/deleteOneEmployee";
        let params = {
          id:values[0].id,
        };
        console.log(params);
        defHttp.post({url: url, params});
        closeModal();
      }
    }
    /** 编辑员工信息：获取row, 删除row*/
    async function onGetData() {
      const values = testCompanyEmployee.value!.getSelectionData()
      console.log('编辑员工信息，获取值:', { values })
      if(values.length == 1 ){
        addNew=false
        editOne=true
        let editParams = {
          id:values[0].id,
          takingTime:values[0].takingTime,
          department:values[0].partment,
        };
        console.log('params:', { editParams })
        //TODO: form中显示待修改的内容
        updateFormValue(editParams);
        openModal(true, {});// 打开弹窗

      }
      else{
        alert("请选择一条编辑的员工信息")
      }
    }

    /**
     * 更新表单配置
     */
    async function updateFormValue(editParams) {
      console.log("editParams:",editParams);
      await setFieldsValue({ Id: editParams.id });
      console.log("The end");
     }


    /**
     * 重置
     */
    async function resetUpdate() {
      //使用useForm方法resetFields清空值
      await resetFields();
    }

    /**
     * 关闭弹窗，点击提交按钮的value值
     * @param values
     */
    async function submitUpdate(values: any) {
      //获取所有值
      let fieldsValue = await getFieldsValue();
      console.log('提交按钮数据::::', values);
      console.log('提交按钮数据fieldsValue::::', fieldsValue);
      let url = "/company/testCompany/addOneEmployee";
      let params = {
        id:companyId,
        employeeId:fieldsValue.Id,
        takingTime:fieldsValue.dateSelect,
        partment:fieldsValue.department,
      };
      console.log("发送的Http请求的params为：",params);
      defHttp.post({url: url, params});
      closeModal();
      addNew=false
      editOne=false
    }

    /**
     * useModalInner() 用于独立的 Modal 内部调用
     */
     //表单赋值
    const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
        console.log("The data is");
        console.log(data.record);
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
  background-color: #0055b3;
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

/** 时间和数字输入框样式 */
:deep(.ant-input-number) {
  width: 100%;
}

:deep(.ant-picker) {
  width: 100%;
}

</style>
