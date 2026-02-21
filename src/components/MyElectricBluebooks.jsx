import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBatteryFull, FaFileAlt, FaClock, FaCheckCircle, FaDownload, FaEdit } from "react-icons/fa";
import { useLang } from "../context/LanguageContext";
import { dashboardLabels } from "../labels/dashboardLabels";
import Pagination from "./Pagination";

const MyElectricBluebooks = () => {
    const { getLabel } = useLang();
    const navigate = useNavigate();
    const [electricBluebooks, setElectricBluebooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchElectricBluebooks(currentPage);
    }, [currentPage]);

    const fetchElectricBluebooks = async (page) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const limit = 5;
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/electric-bluebook/my-bluebooks?page=${page}&limit=${limit}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setElectricBluebooks(data.result || []);
                setTotalPages(data.meta.totalPages || 1);
            }
        } catch (error) {
            console.error("Error fetching electric bluebooks:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "verified":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FaCheckCircle className="mr-1" />
                        {getLabel(dashboardLabels.verified)}
                    </span>
                );
            case "pending":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <FaClock className="mr-1" />
                        {getLabel(dashboardLabels.pending)}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getLabel(dashboardLabels.unknown)}
                    </span>
                );
        }
    };

    const isExpired = (expireDate) => {
        if (!expireDate) return false;
        return new Date(expireDate) < new Date();
    };

    const shouldShowPayTax = (expireDate) => {
        if (!expireDate) return false;
        const today = new Date();
        const expiry = new Date(expireDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 15;
    };

    const handleDownload = async (id) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                navigate('/login');
                return;
            }

            const endpoint = `/electric-bluebook/${id}/download`;
            const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = `electric_bluebook_${id}.pdf`;
                link.click();
                window.URL.revokeObjectURL(link.href);
            } else {
                console.error('Failed to download bluebook');
            }
        } catch (error) {
            console.error('Error downloading bluebook:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-nepal-blue"></div>
            </div>
        );
    }

    return (
        <div className="bg-white/90 shadow-2xl rounded-2xl overflow-hidden animate-fade-in-up mt-10">
            <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-green-600">{getLabel(dashboardLabels.myElectricBluebooks)}</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            {getLabel(dashboardLabels.manageElectricBluebooks)}
                        </p>
                    </div>
                </div>
            </div>

            {electricBluebooks.length === 0 ? (
                <div className="text-center py-16 animate-fade-in-up">
                    <FaFileAlt className="mx-auto h-14 w-14 text-gray-300 animate-pulse" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">{getLabel(dashboardLabels.noElectricBluebooks)}</h3>
                    <p className="mt-2 text-base text-gray-500">
                        {getLabel(dashboardLabels.getStartedElectricBluebook)}
                    </p>
                </div>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {electricBluebooks.map((bluebook, idx) => (
                        <li
                            key={bluebook._id}
                            className="px-6 py-6 hover:bg-green-50/60 transition-colors duration-200 group animate-fade-in-up"
                            style={{ animationDelay: `${idx * 40}ms` }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <FaBatteryFull className="h-10 w-10 text-green-500 drop-shadow group-hover:scale-110 transition-transform duration-200" />
                                    </div>
                                    <div className="ml-6">
                                        <div className="flex items-center space-x-3">
                                            <h4 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                                                {bluebook.vehicleOwnerName}
                                            </h4>
                                            {getStatusBadge(bluebook.status)}
                                            {isExpired(bluebook.taxExpireDate) && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 animate-pulse">
                                                    {getLabel(dashboardLabels.expired)}
                                                </span>
                                            )}
                                            {!isExpired(bluebook.taxExpireDate) && shouldShowPayTax(bluebook.taxExpireDate) && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 animate-pulse">
                                                    {getLabel(dashboardLabels.dueSoon)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-2 text-sm text-gray-500 space-x-2">
                                            <span className="font-medium">{getLabel(dashboardLabels.regNo)}:</span> {bluebook.vehicleRegNo}
                                            <span className="font-medium">| {getLabel(dashboardLabels.model)}:</span> {bluebook.vehicleModel || 'N/A'}
                                            <span className="font-medium">| {getLabel(dashboardLabels.vehicleNumber)}:</span> {bluebook.vehicleNumber}
                                        </div>
                                        <div className="mt-1 text-sm text-gray-400">
                                            <span className="font-medium">{getLabel(dashboardLabels.taxExpires)}:</span> {formatDate(bluebook.taxExpireDate)}
                                            <span className="font-medium ml-2">| {getLabel(dashboardLabels.created)}:</span> {formatDate(bluebook.createdAt)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => navigate(`/electric-bluebook/${bluebook._id}`)}
                                        className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-semibold rounded-lg text-green-600 bg-white hover:bg-green-600 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                                    >
                                        <FaEdit className="mr-1" />
                                        {getLabel(dashboardLabels.view)}
                                    </button>
                                    <button
                                        onClick={() => handleDownload(bluebook._id)}
                                        className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-semibold rounded-lg text-green-600 bg-white hover:bg-green-600 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                                    >
                                        <FaDownload className="mr-1" />
                                        {getLabel(dashboardLabels.download)}
                                    </button>
                                    {shouldShowPayTax(bluebook.taxExpireDate) && (
                                        <button
                                            onClick={() => navigate(`/electric-payment/${bluebook._id}`)}
                                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isExpired(bluebook.taxExpireDate)
                                                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:scale-105 focus:ring-red-500"
                                                    : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:scale-105 focus:ring-yellow-500"
                                                }`}
                                        >
                                            <FaFileAlt className="mr-1" />
                                            {isExpired(bluebook.taxExpireDate) ? getLabel(dashboardLabels.payTaxExpired) : getLabel(dashboardLabels.payTaxDueSoon)}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default MyElectricBluebooks;
