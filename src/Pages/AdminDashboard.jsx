import React, { useEffect, useState } from 'react';
import {
    FaUserPlus,
    FaUserShield,
    FaUserTimes,
    FaUserCog,
    FaUsers
} from 'react-icons/fa';

import SectionDivider from '../Components/UI/SectionDivider';
import CreateUserForm from '../Components/AdminDashboard/CreateUserForm';
import AddApproverForm from '../Components/AdminDashboard/AddApproverForm';
import RemoveApproverForm from '../Components/AdminDashboard/RemoveApproverForm';
import AddAdminForm from '../Components/AdminDashboard/AddAdminForm';
import RemoveAdminForm from '../Components/AdminDashboard/RemoveAdminForm';
import UserList from '../Components/AdminDashboard/UserList';
import { getUsers } from '../services/AdminServices/Adminservices';

const AdminDashboard = () => {

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
                Admin Dashboard
            </h1>

            <div className="max-w-7xl mx-auto space-y-12">
                <div>
                    <SectionDivider title="Create User" Icon={FaUserPlus} />
                    <CreateUserForm />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <SectionDivider title="Add Approver" Icon={FaUserShield} />
                        <AddApproverForm />
                    </div>

                    <div>
                        <SectionDivider title="Remove Approver" Icon={FaUserTimes} />
                        <RemoveApproverForm />
                    </div>

                    <div>
                        <SectionDivider title="Add Admin" Icon={FaUserCog} />
                        <AddAdminForm />
                    </div>

                    <div>
                        <SectionDivider title="Remove Admin" Icon={FaUserTimes} />
                        <RemoveAdminForm />
                    </div>
                </div>

                <div>
                    <SectionDivider title="All Users" Icon={FaUsers} />
                    <UserList />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
