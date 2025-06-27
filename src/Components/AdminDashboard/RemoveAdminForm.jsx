import RoleActionForm from './RoleActionForm';
import { removeAdmin } from '../../services/AdminServices/Adminservices';

const RemoveAdminForm = () => <RoleActionForm actionType="remove" roleType="Admin" apiFunc={removeAdmin} />;

export default RemoveAdminForm;
