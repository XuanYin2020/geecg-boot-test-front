import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
//列表数据
export const columns: BasicColumn[] = [
   {
    title: '姓名',
    align:"center",
    dataIndex: 'name'
   },
   {
    title: '邮箱',
    align:"center",
    dataIndex: 'email'
   },
   {
    title: '电话',
    align:"center",
    dataIndex: 'phone'
   },
   {
    title: '地址',
    align:"center",
    dataIndex: 'aaddress'
   },
   {
    title: '头像',
    align:"center",
    dataIndex: 'images',
    customRender:render.renderImage,
   },
   {
    title: '就职公司名字',
    align:"center",
    dataIndex: 'companyName'
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
	{
      label: "姓名",
      field: 'name',
      component: 'Input',
      //colProps: {span: 6},
 	},
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '姓名',
    field: 'name',
    component: 'Input',
  },
  {
    label: '邮箱',
    field: 'email',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: false},
                 { pattern: /^([\w]+\.*)([\w]+)@[\w]+\.\w{3}(\.\w{2}|)$/, message: '请输入正确的电子邮件!'},
          ];
     },
  },
  {
    label: '电话',
    field: 'phone',
    component: 'Input',
  },
  {
    label: '地址',
    field: 'aaddress',
    component: 'Input',
  },
  {
    label: '头像',
    field: 'images',
    component: 'JImageUpload',
    componentProps:{
    },
  },
  {
    label: '就职公司id',
    field: 'companyIds',
    component: 'JSelectMultiple',
    componentProps:{
        dictCode:"test_company,name,id"
     },
  },
	// TODO 主键隐藏字段，目前写死为ID
	{
	  label: '',
	  field: 'id',
	  component: 'Input',
	  show: false
	},
];



/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}
