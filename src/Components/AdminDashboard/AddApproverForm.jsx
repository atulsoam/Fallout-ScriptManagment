import RoleActionForm from './RoleActionForm';
import { addApprover } from '../../services/AdminServices/Adminservices';

const AddApproverForm = () => <RoleActionForm actionType="add" roleType="Approver" apiFunc={addApprover} />;

export default AddApproverForm;
