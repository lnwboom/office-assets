"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Chart } from "react-chartjs-2";
import { showToast } from "@/components/Toast";
import { ConfirmModal } from "@/components/Modal";
import "chart.js/auto";

interface Asset {
  _id: string;
  code: string;
  name: string;
  type: string;
  status: "IN_USE" | "AVAILABLE" | "BROKEN" | "MAINTENANCE";
  description?: string;
  purchaseDate: string;
  createdAt: string; // Added field
}

interface DashboardStats {
  total: number;
  inUse: number;
  available: number;
  broken: number;
  maintenance: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    inUse: 0,
    available: 0,
    broken: 0,
    maintenance: 0,
  });
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("asc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateField, setDateField] = useState("createdAt");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    assetId: string | null;
  }>({
    isOpen: false,
    assetId: null,
  });
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch assets and stats
    const fetchData = async () => {
      try {
        setError(null);
        const response = await fetch(
          `/api/assets?sortField=${sortField}&sortOrder=${sortOrder}&startDate=${startDate}&endDate=${endDate}&dateField=${dateField}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "เกิดข้อผิดพลาดในการดึงข้อมูล");
        }

        const data = await response.json();
        const transformedAssets = data.assets.map((asset: any) => ({
          ...asset,
          purchaseDate: asset.purchaseDate,
          createdAt: asset.createdAt,
        }));

        setAssets(transformedAssets);
        setStats(data.stats);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการดึงข้อมูล"
        );
      }
    };

    if (session) {
      fetchData();
    }
  }, [session, sortField, sortOrder, startDate, endDate, dateField]);

  const filteredAssets = assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chartData = {
    labels: ["In Use", "Available", "Broken", "Maintenance"],
    datasets: [
      {
        label: "Asset Distribution",
        data: [stats.inUse, stats.available, stats.broken, stats.maintenance],
        backgroundColor: ["#4CAF50", "#2196F3", "#F44336", "#FFC107"],
      },
    ],
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteModal({ isOpen: true, assetId: id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.assetId) return;

    try {
      const response = await fetch(
        `/api/assets/${encodeURIComponent(deleteModal.assetId)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        let errorMessage = "เกิดข้อผิดพลาดในการลบข้อมูล";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = "เกิดข้อผิดพลาดในการลบข้อมูล";
        }
        throw new Error(errorMessage);
      }

      // Refresh the assets list after deletion
      setAssets((prevAssets) =>
        prevAssets.filter((asset) => asset._id !== deleteModal.assetId)
      );

      showToast.success("ลบอุปกรณ์สำเร็จ", "อุปกรณ์ถูกลบออกจากระบบแล้ว");
    } catch (error) {
      console.error("Error deleting asset:", error);
      showToast.error(
        "เกิดข้อผิดพลาดในการลบข้อมูล",
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
      );
    } finally {
      setDeleteModal({ isOpen: false, assetId: null });
    }
  };

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* สรุปข้อมูล - การ์ดสถิติ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* จำนวนอุปกรณ์ทั้งหมด */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  อุปกรณ์ทั้งหมด
                </p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-blue-400/30 p-3 rounded-full">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* กำลังใช้งาน */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  กำลังใช้งาน
                </p>
                <p className="text-3xl font-bold">{stats.inUse}</p>
              </div>
              <div className="bg-green-400/30 p-3 rounded-full">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* พร้อมใช้งาน */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">
                  พร้อมใช้งาน
                </p>
                <p className="text-3xl font-bold">{stats.available}</p>
              </div>
              <div className="bg-indigo-400/30 p-3 rounded-full">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* ชำรุด */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">ชำรุด</p>
                <p className="text-3xl font-bold">{stats.broken}</p>
              </div>
              <div className="bg-red-400/30 p-3 rounded-full">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* อยู่ระหว่างซ่อม */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">
                  อยู่ระหว่างซ่อม
                </p>
                <p className="text-3xl font-bold">{stats.maintenance}</p>
              </div>
              <div className="bg-yellow-400/30 p-3 rounded-full">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-gray-900 sm:truncate">
              {session?.user?.role === "ADMIN"
                ? "แผงควบคุมผู้ดูแลระบบ"
                : "รายการอุปกรณ์"}
            </h1>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 md:mb-0">
              ตัวกรองและการจัดเรียง
            </h2>
            <button
              onClick={() => {
                setSearchQuery("");
                setStartDate("");
                setEndDate("");
                setDateField("createdAt");
              }}
              className="px-4 py-2 bg-red-500 text-white font-medium text-sm rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="searchQuery"
                className="block text-sm font-medium text-gray-700"
              >
                ค้นหาอุปกรณ์
              </label>
              <input
                id="searchQuery"
                type="text"
                placeholder="ค้นหาอุปกรณ์..."
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="dateField"
                className="block text-sm font-medium text-gray-700"
              >
                เลือกวันที่
              </label>
              <select
                id="dateField"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={dateField}
                onChange={(e) => setDateField(e.target.value)}
              >
                <option value="createdAt">วันที่สร้าง</option>
                <option value="purchaseDate">วันที่สั่งซื้อ</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700"
              >
                วันที่เริ่มต้น
              </label>
              <input
                id="startDate"
                type="date"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700"
              >
                วันที่สิ้นสุด
              </label>
              <input
                id="endDate"
                type="date"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("code")}
                    >
                      รหัส{" "}
                      {sortField === "code" &&
                        (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      ชื่อ{" "}
                      {sortField === "name" &&
                        (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("type")}
                    >
                      ประเภท{" "}
                      {sortField === "type" &&
                        (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      รายละเอียด
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("status")}
                    >
                      สถานะ{" "}
                      {sortField === "status" &&
                        (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      วันที่สร้าง{" "}
                      {sortField === "createdAt" &&
                        (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("purchaseDate")}
                    >
                      วันที่สั่งซื้อ{" "}
                      {sortField === "purchaseDate" &&
                        (sortOrder === "asc" ? "▲" : "▼")}
                    </th>

                    {session?.user?.role === "ADMIN" && (
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        จัดการ
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssets.map((asset) => (
                    <tr key={asset._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {asset.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {asset.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {asset.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div
                          className="truncate"
                          title={asset.description || ""}
                        >
                          {asset.description || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            asset.status === "IN_USE"
                              ? "bg-green-100 text-green-800"
                              : asset.status === "AVAILABLE"
                              ? "bg-blue-100 text-blue-800"
                              : asset.status === "MAINTENANCE"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {asset.status === "IN_USE"
                            ? "กำลังใช้งาน"
                            : asset.status === "AVAILABLE"
                            ? "พร้อมใช้งาน"
                            : asset.status === "MAINTENANCE"
                            ? "อยู่ระหว่างซ่อม"
                            : "ชำรุด"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(asset.createdAt).toLocaleDateString("th-TH")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(asset.purchaseDate).toLocaleDateString(
                          "th-TH"
                        )}
                      </td>

                      {session?.user?.role === "ADMIN" && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() =>
                              router.push(`/assets/${asset._id}/edit`)
                            }
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(asset._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            ลบ
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {session?.user?.role === "ADMIN" && (
          <div className="bg-white shadow-xl rounded-2xl p-8 mb-8   mt-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  เพิ่มอุปกรณ์ใหม่
                </h2>
                <p className="text-gray-600">
                  กรอกข้อมูลอุปกรณ์ที่ต้องการเพิ่มเข้าสู่ระบบ
                </p>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const newAsset = Object.fromEntries(formData.entries());

                try {
                  const response = await fetch("/api/assets", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newAsset),
                  });

                  if (!response.ok) {
                    throw new Error("เกิดข้อผิดพลาดในการเพิ่มอุปกรณ์");
                  }

                  const createdAsset = await response.json();
                  setAssets((prevAssets) => [...prevAssets, createdAsset]);
                  showToast.success(
                    "เพิ่มอุปกรณ์สำเร็จ",
                    "อุปกรณ์ใหม่ถูกเพิ่มเข้าสู่ระบบแล้ว"
                  );
                  (e.target as HTMLFormElement).reset();
                } catch (error) {
                  console.error("Error adding asset:", error);
                  showToast.error(
                    "เกิดข้อผิดพลาดในการเพิ่มอุปกรณ์",
                    error instanceof Error
                      ? error.message
                      : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
                  );
                }
              }}
              className="space-y-6"
            >
              {/* แถวที่ 1: รหัสและชื่อ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="code"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    รหัสอุปกรณ์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-400"
                    placeholder="เช่น ASSET001"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    ชื่ออุปกรณ์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-400"
                    placeholder="เช่น คอมพิวเตอร์ Dell"
                  />
                </div>
              </div>

              {/* แถวที่ 2: ประเภทและสถานะ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="type"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    ประเภท <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="type"
                    name="type"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-400"
                    placeholder="เช่น อุปกรณ์อิเล็กทรอนิกส์"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="status"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    สถานะ <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                  >
                    <option value="">เลือกสถานะ</option>
                    <option value="AVAILABLE">พร้อมใช้งาน</option>
                    <option value="IN_USE">กำลังใช้งาน</option>
                    <option value="BROKEN">ชำรุด</option>
                    <option value="MAINTENANCE">อยู่ระหว่างซ่อม</option>
                  </select>
                </div>
              </div>

              {/* แถวที่ 3: รายละเอียด */}
              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-gray-700"
                >
                  รายละเอียดเพิ่มเติม
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-400 resize-none"
                  placeholder="รายละเอียดเพิ่มเติมของอุปกรณ์ เช่น สเปค, หมายเหตุ, ตำแหน่งที่ตั้ง..."
                />
              </div>

              {/* แถวที่ 4: วันที่สั่งซื้อ */}
              <div className="space-y-2">
                <label
                  htmlFor="purchaseDate"
                  className="block text-sm font-semibold text-gray-700"
                >
                  วันที่สั่งซื้อ <span className="text-red-500">*</span>
                </label>
                <input
                  id="purchaseDate"
                  name="purchaseDate"
                  type="date"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* ปุ่มส่งฟอร์ม */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
                >
                  <svg
                    className="w-5 h-5 inline mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  เพิ่มอุปกรณ์
                </button>
              </div>
            </form>
          </div>
        )}

       
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, assetId: null })}
        onConfirm={confirmDelete}
        title="ยืนยันการลบอุปกรณ์"
        message="คุณต้องการลบอุปกรณ์นี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้"
        confirmText="ลบอุปกรณ์"
        cancelText="ยกเลิก"
        type="danger"
      />
    </div>
  );
}
