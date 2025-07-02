import React, { useEffect, useState } from "react";
import { getJobs, unscheduleJob } from "../services/ScriptScheduler/schedulerService";
import ScheduleForm from "../Components/ScriptSchedule/ScheduleForm";
import JobList from "../Components/ScriptSchedule/JobList";
import LoadingOverlay from "../Components/LoadingOverlay";
import { toast } from "react-toastify";
import Footer from "../Components/UI/Footer";


const SchedulerPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadJobs = async () => {
        try {
            setLoading(true);
            const data = await getJobs();
            setJobs(data);
        } catch (err) {
            console.error("Failed to fetch jobs", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await unscheduleJob(id);
            const data = await getJobs();
            setJobs(data);
            toast.success("Script is unscheduled");
        } catch (err) {
            setLoading(false);
            console.error("Delete failed", err);
            toast.error("Script unschedule failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {loading && <LoadingOverlay />}

            <div className="flex-grow p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Left Column: Form */}
                        <ScheduleForm onJobScheduled={loadJobs} />

                        {/* Right Column: Jobs List */}
                        <JobList jobs={jobs} onDelete={handleDelete} />
                    </div>
                </div>
            </div>

                  {/* <Footer /> */}

        </div>
    );
};

export default SchedulerPage;
