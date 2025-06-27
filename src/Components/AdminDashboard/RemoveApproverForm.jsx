import RoleActionForm from './RoleActionForm';
import { removeApprover } from '../../services/AdminServices/Adminservices';

const RemoveApproverForm = () => <RoleActionForm actionType="remove" roleType="Approver" apiFunc={removeApprover} />;

export default RemoveApproverForm;
