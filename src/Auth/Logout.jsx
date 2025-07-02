import React, { useEffect, useState } from "react";

import { logout } from "../services/auth/authServices";
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from "../Components/LoadingOverlay";

export default function Logout() {
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate();
    navigate('/login');

    logout()

    setLoading(false)

    if (loading) return <LoadingOverlay />


}
