import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { UserContext } from "../UserContext";
import "react-toastify/dist/ReactToastify.css";
import {
  ComputerDesktopIcon,
  TagIcon,
  HashtagIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "../supabaseClient";
import Sidebar from "../components/Sidebar";
import { useSupabase } from "../supabase/hooks/useSupabase";
import { validateAssetForm } from "../utils/validationUtils";
import { addAsset } from "../supabase/services/assetService";
import PageHeader from "../components/PageHeader";
const AddAssetPage = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const { users, loading: usersLoading, profile } = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: "",
    tag: "",
    serial: "",
    description: "",
    is_active: true,
    assigned_to: null,
  });

  const [errors, setErrors] = useState({});
  const [assignedUser, setAssignedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("add-asset");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  /* ---------------- ADD ASSET SERVICE ---------------- */
  const addAssetService = async () => {
    const validation = validateAssetForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      throw new Error("Please fix the errors in the form");
    }

    const assetData = {
      name: formData.name,
      tag: formData.tag,
      serial: formData.serial,
      description: formData.description || null,
      is_active: formData.is_active,
      assigned_to: assignedUser?.id || null,
      created_at: new Date().toISOString(),
    };

    return await addAsset(assetData);
  };

  const {
    isLoading: loading,
    error,
    onRequest: submitAsset,
  } = useSupabase({
    onRequestService: addAssetService,
    onSuccess: () => {
      toast.success("Asset added successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setFormData({
        name: "",
        tag: "",
        serial: "",
        description: "",
        is_active: true,
        assigned_to: null,
      });
      setAssignedUser(null);
      setErrors({});

      if (formRef.current) {
        formRef.current.reset();
      }

      setTimeout(() => {
        navigate("/assets");
      }, 2000);
    },
    onError: (error) => {
      toast.error(`Failed to add asset: ${error?.message || error}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitAsset();
  };

  const handleReset = () => {
    setFormData({
      name: "",
      tag: "",
      serial: "",
      description: "",
      is_active: true,
      assigned_to: null,
    });
    setAssignedUser(null);
    setErrors({});
    if (formRef.current) {
      formRef.current.reset();
    }
    toast.info("Form cleared", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <ToastContainer />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          navigate={navigate}
          userProfile={profile}
        />
        {/* <div className="py-8"> */}
        <main className="flex-1">
          <PageHeader
            title="Add New Asset"
            subtitle="Register a new asset to your inventory"
          />
          <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Header Back Button */}
              <div className="mb-8">
                <button
                  onClick={() => navigate("/assets")}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4 transition-colors"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Assets
                </button>
              </div>

              {/* Form Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="p-8">
                  <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="space-y-8"
                  >
                    {/* Asset Details Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <ComputerDesktopIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Asset Information
                        </h2>
                      </div>

                      {/* Name Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Asset Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <ComputerDesktopIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`block w-full pl-10 pr-3 py-3 border ${
                              errors.name ? "border-red-300" : "border-gray-300"
                            } rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                            placeholder="e.g., MacBook Pro 16-inch"
                          />
                        </div>
                        {errors.name && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Tag and Serial Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tag Field */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Asset Tag <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <TagIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              name="tag"
                              value={formData.tag}
                              onChange={handleChange}
                              className={`block w-full pl-10 pr-3 py-3 border ${
                                errors.tag
                                  ? "border-red-300"
                                  : "border-gray-300"
                              } rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                              placeholder="e.g., ASSET-001"
                            />
                          </div>
                          {errors.tag && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                              {errors.tag}
                            </p>
                          )}
                        </div>

                        {/* Serial Field */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Serial Number{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <HashtagIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              name="serial"
                              value={formData.serial}
                              onChange={handleChange}
                              className={`block w-full pl-10 pr-3 py-3 border ${
                                errors.serial
                                  ? "border-red-300"
                                  : "border-gray-300"
                              } rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                              placeholder="e.g., C02XYZ123ABC"
                            />
                          </div>
                          {errors.serial && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                              {errors.serial}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Description Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Description (Optional)
                        </label>
                        <div className="relative">
                          <div className="absolute top-3 left-3">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                            placeholder="Provide additional details about this asset..."
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Maximum 500 characters. Currently{" "}
                          {formData.description.length}/500
                        </p>
                      </div>
                    </div>

                    {/* Status Section */}
                    <div className="space-y-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Asset Status
                        </h2>
                      </div>

                      {/* Active Toggle */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg border border-gray-200">
                            <CheckCircleIcon
                              className={`h-5 w-5 ${
                                formData.is_active
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="is_active"
                              className="block text-sm font-medium text-gray-900 cursor-pointer"
                            >
                              Active Asset
                            </label>
                            <p className="text-sm text-gray-500">
                              Inactive assets won't appear in assignment lists
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div
                            className={`block w-14 h-8 rounded-full cursor-pointer transition-colors duration-200 ${
                              formData.is_active
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                is_active: !prev.is_active,
                              }))
                            }
                          >
                            <div
                              className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ${
                                formData.is_active
                                  ? "transform translate-x-6"
                                  : ""
                              }`}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <UserCircleIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Assign Asset (Optional)
                        </h2>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Assign to User
                        </label>

                        <select
                          value={assignedUser?.id || ""}
                          onChange={(e) => {
                            const selectedUser = users.find(
                              (u) => u.id === e.target.value
                            );
                            setAssignedUser(selectedUser || null);
                          }}
                          disabled={usersLoading}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        >
                          <option value="">— Not Assigned —</option>

                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.first_name} {user.last_name} ({user.email})
                            </option>
                          ))}
                        </select>

                        {assignedUser && (
                          <p className="text-sm text-green-700 mt-2">
                            ✔ Assigned to {assignedUser.first_name}{" "}
                            {assignedUser.last_name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 inline-flex items-center justify-center px-6 py-4 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Adding Asset...
                          </>
                        ) : (
                          <>
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add Asset to Inventory
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={loading}
                        className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Clear Form
                      </button>
                    </div>
                  </form>

                  {/* Form Tips */}
                  <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">
                      💡 Tips for adding assets
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></span>
                        Asset tags should be unique and follow your
                        organization's naming convention
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></span>
                        Serial numbers help track warranty and service history
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></span>
                        Assign assets to team members to track responsibility
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-500">Total Fields</div>
                  <div className="text-2xl font-bold text-gray-900">6</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-500">Required Fields</div>
                  <div className="text-2xl font-bold text-red-600">3</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-500">Asset Status</div>
                  <div className="text-2xl font-bold text-green-600">
                    Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddAssetPage;
