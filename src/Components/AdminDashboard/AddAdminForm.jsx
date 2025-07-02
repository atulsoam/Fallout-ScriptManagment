import RoleActionForm from './RoleActionForm';
import { addAdmin } from '../../services/AdminServices/Adminservices';

const AddAdminForm = () => <RoleActionForm actionType="add" roleType="Admin" apiFunc={addAdmin} />;

export default AddAdminForm;
