import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import {JVxeTypes,JVxeColumn} from '/@/components/jeecg/JVxeTable/types'
//列表数据
export const columns: BasicColumn[] = [
   {
    title: '公司名字',
    align:"center",
    dataIndex: 'name'
   },
   {
    title: '公司类型',
    align:"center",
    dataIndex: 'type'
   },
   {
    title: '地址',
    align:"center",
    dataIndex: 'address'
   },
   {
    title: '负责人',
    align:"center",
    dataIndex: 'ceo'
   },
   {
    title: '员工数量',
    align:"center",
    dataIndex: 'numberEmplyee'
   },
   {
    title: '联系信息',
    align:"center",
    dataIndex: 'contact'
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
	{
      label: "公司名字",
      field: "name",
      component: 'Input',
      //colProps: {span: 6},
 	},
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '公司名字',
    field: 'name',
    component: 'Input',
  },
  {
    label: '公司类型',
    field: 'type',
    component: 'Input',
  },
  {
    label: '地址',
    field: 'address',
    component: 'Input',
  },
  {
    label: '负责人',
    field: 'ceo',
    component: 'Input',
  },
  {
    label: '员工数量',
    field: 'numberEmplyee',
    component: 'InputNumber',
  },
  {
    label: '联系信息',
    field: 'contact',
    component: 'Input',
  },
	// TODO 主键隐藏字段，目前写死为ID
	{
	  label: '',
	  field: 'id',
	  component: 'Input',
	  show: false
	},
];
//子表单数据
//子表表格配置
export const testCompanyEmployeeColumns: JVxeColumn[] = [
    {
      title: '员工id',
      key: 'employeeId',
      type: JVxeTypes.select,
      options:[],
      dictCode:"test_employee,name,id",
      width:"200px",
      placeholder: '请输入${title}',
      defaultValue:'',
    },
    {
      title: '入职时间',
      key: 'takingTime',
      type: JVxeTypes.date,
      width:"200px",
      placeholder: '请输入${title}',
      defaultValue:'',
    },
    {
      title: '入职部门',
      key: 'partment',
      type: JVxeTypes.input,
      width:"200px",
      placeholder: '请输入${title}',
      defaultValue:'',
    },
  ]
