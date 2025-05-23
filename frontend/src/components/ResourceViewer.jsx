// Import the useTranslation hook at the top of the file
import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next"; // Add this import

export default function ResourceViewer() {
  const { t } = useTranslation(); // Add this line to use translations
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedResource, setSelectedResource] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [filters, setFilters] = useState({
    subject: "",
    yearLevel: "",
    specialization: "",
  });

  // Subject options
  const subjects = [
    { value: "", label: t("resourceViewer.filters.allSubjects") },
    { value: "SVT", label: "subjects.SVT" },
    { value: "Mathematics", label: t("subjects.mathematics") },
    { value: "Engineering Sciences", label: t("subjects.engineeringSciences") },
    { value: "Physics & chemistry", label: t("subjects.physicsChemistry") },
    { value: "Arabic", label: t("subjects.arabic") },
    { value: "History and Geography", label: t("subjects.historyGeography") },
    { value: "French", label: t("subjects.french") },
    { value: "English", label: t("subjects.english") },
    { value: "Islamic Education", label: t("subjects.islamicEducation") },
    { value: "Philosophies", label: t("subjects.philosophies") },
  ];

  // Year level options
  const yearLevels = [
    { value: "", label: t("resourceViewer.filters.allYears") },
    { value: "all", label: t("resourceViewer.filters.general") },
    { value: "tc", label: t("resourceViewer.filters.tc") },
    { value: "1bac", label: t("resourceViewer.filters.firstYear") },
    { value: "2bac", label: t("resourceViewer.filters.secondYear") },
  ];
  // Base specialization options
  const allSpecializations = [
    {
      value: "",
      label: "All Specializations",
      yearLevels: ["", "all", "tc", "1bac", "2bac"],
    },
    {
      value: "all",
      label: "General (All Specializations)",
      yearLevels: ["", "all", "tc", "1bac", "2bac"],
    },
    { value: "science", label: "Science", yearLevels: ["tc"] },
    { value: "letter", label: "Letter", yearLevels: ["tc", "1bac", "2bac"] },
    {
      value: "se",
      label: "SE (Sciences Expérimentales)",
      yearLevels: ["1bac"],
    },
    { value: "sm", label: "SM (Sciences Mathématiques)", yearLevels: ["1bac"] },
    {
      value: "sh",
      label: "SH (Sciences Humaines)",
      yearLevels: ["1bac", "2bac"],
    },
    {
      value: "spc",
      label: "SPC (Sciences Physiques et Chimiques)",
      yearLevels: ["2bac"],
    },
    {
      value: "svt",
      label: "SVT (Sciences de la Vie et de la Terre)",
      yearLevels: ["1bac", "2bac"],
    },
    {
      value: "smb",
      label: "SMB (Sciences Mathématiques B)",
      yearLevels: ["2bac"],
    },
    {
      value: "smb",
      label: "SMA (Sciences Mathématiques A)",
      yearLevels: ["2bac"],
    },
    {
      value: "al",
      label: "AL (Arabic et Lettres)",
      yearLevels: ["1bac", "2bac"],
    },
  ];

  // AlloSchool links mapping
  const alloSchoolLinks = {
    // TC (Tronc Commun)
    tc: {
      Mathematics: {
        science:
          "https://www.alloschool.com/course/mathematiques-tronc-commun-sciences-biof",
        letter:
          "https://www.alloschool.com/course/alriadhiat-aljtha-almshtrk-aadab-oalom-insania",
      },
      "Physics & chemistry": {
        science:
          "https://www.alloschool.com/course/physique-et-chimie-tronc-commun-sciences-biof",
      },
      SVT: {
        science:
          "https://www.alloschool.com/course/sciences-de-la-vie-et-de-la-terre-svt-tronc-commun-sciences",
        letter:
          "https://www.alloschool.com/course/alom-alhiaa-oalardh-aljtha-mshtrk-aadab-oalom-insania",
      },
      Arabic: {
        science:
          "https://www.alloschool.com/course/allgha-alarbia-aljtha-almshtrk-alom",
        letter:
          "https://www.alloschool.com/course/allgha-alarbia-aljtha-almshtrk-aadab-oalom-insania",
      },
      "History and Geography": {
        science:
          "https://www.alloschool.com/course/alijtmaaiat-aljtha-almshtrk-alom",
        letter:
          "https://www.alloschool.com/course/alijtmaaiat-aljtha-mshtrk-aadab-oalom-insania",
      },
      French: {
        science:
          "https://www.alloschool.com/course/francais-tronc-commun-sciences",
        letter:
          "https://www.alloschool.com/course/francais-tronc-commun-lettres-et-sciences-humaines",
      },
      English: {
        science:
          "https://www.alloschool.com/course/anglais-tronc-commun-sciences",
        letter:
          "https://www.alloschool.com/course/anglais-tronc-commun-lettres-et-sciences-humaines",
      },
      "Islamic Education": {
        science:
          "https://www.alloschool.com/course/altrbia-alislamia-aljtha-almshtrk-alom",
        letter:
          "https://www.alloschool.com/course/altrbia-alislamia-aljtha-mshtrk-aadab-oalom-insania",
      },
      Philosophies: {
        science:
          "https://www.alloschool.com/course/alflsfa-aljtha-almshtrk-alom",
        letter:
          "https://www.alloschool.com/course/alflsfa-aljtha-mshtrk-aadab-oalom-insania",
      },
    },

    // 1BAC (First Year)
    "1bac": {
      Mathematics: {
        se: "https://www.alloschool.com/index.ph%70/course/mathematiques-1er-bac-sciences-experimentales-biof",
        sm: "https://www.alloschool.com/index.ph%70/course/mathematiques-1er-bac-sciences-mathematiques-biof",
        sh: "https://www.alloschool.com/index.ph%70/course/alriadhiat-alaola-bak-aadab-oalom-insania",
      },

      "Physics & chemistry": {
        se: "https://www.alloschool.com/index.ph%70/course/physique-et-chimie-1er-bac-sciences-experimentales-biof",
        sm: "https://www.alloschool.com/index.ph%70/course/physique-et-chimie-1er-bac-sciences-mathematiques-biof",
      },
      SVT: {
        se: "https://www.alloschool.com/index.ph%70/course/sciences-de-la-vie-et-de-la-terre-svt-1er-bac-sciences-experimentales",
        sm: "https://www.alloschool.com/index.ph%70/course/sciences-de-la-vie-et-de-la-terre-svt-1er-bac-sciences-mathematiques-biof",
        sh: "https://www.alloschool.com/index.ph%70/course/alom-alhiaa-oalardh-alaola-bak-aadab-oalom-insania",
      },
      Arabic: {
        se: "https://www.alloschool.com/index.ph%70/course/allgha-alarbia-alaola-bak-alom-tjribia",
        sm: "https://www.alloschool.com/index.ph%70/course/allgha-alarbia-alaola-bakaloria-alom-riadhia",
        sh: "https://www.alloschool.com/index.ph%70/course/allgha-alarbia-alaola-bak-aadab-oalom-insania",
      },
      "History and Geography": {
        se: "https://www.alloschool.com/index.ph%70/course/alijtmaaiat-alaola-bak-alom-tjribia",
        sm: "https://www.alloschool.com/index.ph%70/course/alijtmaaiat-alaola-bak-alom-riadhia",
        sh: "https://www.alloschool.com/index.ph%70/course/alijtmaaiat-alaola-bak-aadab-oalom-insania",
      },
      French: {
        se: "https://www.alloschool.com/index.ph%70/course/francais-1er-bac-sciences-experimentales",
        sm: "https://www.alloschool.com/index.ph%70/course/francais-1er-bac-sciences-mathematiques",
        sh: "https://www.alloschool.com/index.ph%70/course/francais-1er-bac-lettres-et-sciences-humaines",
      },
      English: {
        se: "https://www.alloschool.com/index.ph%70/course/anglais-1er-bac-sciences-experimentales",
        sm: "https://www.alloschool.com/index.ph%70/course/anglais-1er-bac-sciences-mathematiques",
        sh: "https://www.alloschool.com/index.ph%70/course/anglais-1er-bac-lettres-et-sciences-humaines",
      },
      "Islamic Education": {
        se: "https://www.alloschool.com/index.ph%70/course/altrbia-alislamia-alaola-bak-alom-tjribia",
        sm: "https://www.alloschool.com/index.ph%70/course/altrbia-alislamia-alaola-bak-alom-riadhia",
        sh: "https://www.alloschool.com/index.ph%70/course/altrbia-alislamia-alaola-bak-aadab-oalom-insania",
      },
      Philosophies: {
        se: "https://www.alloschool.com/index.ph%70/course/alflsfa-alaola-bak-alom-tjribia",
        sm: "https://www.alloschool.com/index.ph%70/course/alflsfa-alaola-bakaloria-alom-riadhia",
        sh: "https://www.alloschool.com/index.ph%70/course/alflsfa-alaola-bak-aadab-oalom-insania",
      },
    },

    // 2BAC (Second Year)
    "2bac": {
      Mathematics: {
        smb: "https://www.alloschool.com/index.ph%70/course/mathematiques-2eme-bac-sciences-mathematiques-b-biof",
        sma: "https://www.alloschool.com/index.ph%70/course/mathematiques-2eme-bac-sciences-mathematiques-a-biof",
        spc: "https://www.alloschool.com/index.ph%70/course/mathematiques-2eme-bac-sciences-physiques-biof",
        svt: "https://www.alloschool.com/index.ph%70/course/mathematiques-2eme-bac-sciences-de-la-vie-et-de-la-terre-biof",
        sh: "https://www.alloschool.com/index.ph%70/course/alriadhiat-althania-bak-alom-insania",
        al: "https://www.alloschool.com/index.ph%70/course/alriadhiat-althania-bak-dab",
      },
      "Engineering Sciences": {
        smb: "https://www.alloschool.com/index.ph%70/course/sciences-de-l-ingenieur-2eme-bac-sciences-mathematiques-b#top",
      },
      "Physics & chemistry": {
        smb: "https://www.alloschool.com/index.ph%70/course/physique-et-chimie-2eme-bac-sciences-mathematiques-b-biof",
        sma: "https://www.alloschool.com/index.ph%70/course/physique-et-chimie-2eme-bac-sciences-mathematiques-a-biof",
        spc: "https://www.alloschool.com/index.ph%70/course/physique-et-chimie-2eme-bac-sciences-de-la-vie-et-de-la-terre-biof",
        svt: "https://www.alloschool.com/course/alfizia-walkimia-althania-bakaloria-alom-alhiat-walarth-biof",
      },
      SVT: {
        sma: "https://www.alloschool.com/index.ph%70/course/sciences-de-la-vie-et-de-la-terre-svt-2eme-bac-sciences-mathematiques-a-biof",
        spc: "https://www.alloschool.com/index.ph%70/course/sciences-de-la-vie-et-de-la-terre-svt-2eme-bac-sciences-physiques-biof",
        svt: "https://www.alloschool.com/index.ph%70/course/sciences-de-la-vie-et-de-la-terre-svt-2eme-bac-sciences-de-la-vie-et-de-la-terre-biof",
      },
      Arabic: {
        al: "https://www.alloschool.com/index.ph%70/course/allgha-alarbia-althania-bak-aadab",
        sh: "https://www.alloschool.com/index.ph%70/course/allgha-alarbia-althania-bak-alom-insania",
        smb: "https://www.alloschool.com/index.ph%70/course/allgha-alarbia-althania-bak-alom-riadhia-b",
        sma: "https://www.alloschool.com/index.ph%70/course/allgha-alarbia-althania-bak-alom-riadhia-awa",
        spc: "https://www.alloschool.com/index.ph%70/course/allgha-alarbia-althania-bak-alom-fiziaiia",
        svt: "https://www.alloschool.com/index.ph%70/course/allgha-alarbia-althania-bak-alom-alhiaa-oalardh",
      },
      "History and Geography": {
        al: "https://www.alloschool.com/index.ph%70/course/alijtmaaiat-althania-bak-aadab",
        sh: "https://www.alloschool.com/index.ph%70/course/alijtmaaiat-althania-bak-alom-insania-1",
      },
      French: {
        al: "https://www.alloschool.com/index.ph%70/course/francais-2eme-bac-lettres",
        sh: "https://www.alloschool.com/index.ph%70/course/francais-2eme-bac-sciences-humaines",
        smb: "https://www.alloschool.com/index.ph%70/course/francais-2eme-bac-sciences-mathematiques-b",
        sma: "https://www.alloschool.com/index.ph%70/course/francais-2eme-bac-sciences-mathematiques-a",
        spc: "https://www.alloschool.com/index.ph%70/course/francais-2eme-bac-sciences-physiques",
        svt: "https://www.alloschool.com/index.ph%70/course/francais-2eme-bac-sciences-de-la-vie-et-de-la-terre",
      },
      English: {
        al: "https://www.alloschool.com/index.ph%70/course/anglais-2eme-bac-lettres",
        sh: "https://www.alloschool.com/index.ph%70/course/anglais-2eme-bac-sciences-humaines",
        smb: "https://www.alloschool.com/index.ph%70/course/anglais-2eme-bac-sciences-mathematiques-b",
        sma: "https://www.alloschool.com/index.ph%70/course/anglais-2eme-bac-sciences-mathematiques-a",
        spc: "https://www.alloschool.com/index.ph%70/course/anglais-2eme-bac-sciences-physiques",
        svt: "https://www.alloschool.com/index.ph%70/course/anglais-2eme-bac-sciences-de-la-vie-et-de-la-terre",
      },
      "Islamic Education": {
        al: "https://www.alloschool.com/index.ph%70/course/altrbia-alislamia-althania-bak-aadab",
        sh: "https://www.alloschool.com/index.ph%70/course/altrbia-alislamia-althania-bak-alom-insania",
        smb: "https://www.alloschool.com/index.ph%70/course/altrbia-alislamia-althania-bak-alom-riadhia-b",
        sma: "https://www.alloschool.com/index.ph%70/course/altrbia-alislamia-althania-bak-alom-riadhia-awa",
        spc: "https://www.alloschool.com/index.ph%70/course/altrbia-alislamia-althania-bak-alom-fiziaiia",
        svt: "https://www.alloschool.com/index.ph%70/course/altrbia-alislamia-althania-bak-alom-alhiaa-oalardh",
      },
      Philosophies: {
        al: "https://www.alloschool.com/index.ph%70/course/alflsfa-althania-bak-aadab",
        sh: "https://www.alloschool.com/index.ph%70/course/alflsfa-althania-bak-alom-insania-1",
        smb: "https://www.alloschool.com/index.ph%70/course/alflsfa-althania-bak-alom-riadhia-b",
        sma: "https://www.alloschool.com/index.ph%70/course/alflsfa-althania-bak-alom-riadhia-awa",
        spc: "https://www.alloschool.com/index.ph%70/course/alflsfa-althania-bak-alom-fiziaiia",
        svt: "https://www.alloschool.com/index.ph%70/course/alflsfa-althania-bak-alom-alhiaa-oalardh",
      },
    },
  };

  // Get AlloSchool link based on current filters
  const getAlloSchoolLink = () => {
    const { yearLevel, subject, specialization } = filters;
    if (!yearLevel || !subject || !specialization) return null;

    try {
      return alloSchoolLinks[yearLevel]?.[subject]?.[specialization] || null;
    } catch (error) {
      return null;
    }
  };

  // Filtered specialization options based on selected year level
  const getFilteredSpecializations = () => {
    if (!filters.yearLevel) {
      return allSpecializations.filter((spec) => spec.yearLevels.includes(""));
    }
    return allSpecializations.filter((spec) =>
      spec.yearLevels.includes(filters.yearLevel)
    );
  };

  // Fetch resources when component mounts
  useEffect(() => {
    fetchResources();
  }, []);

  // Reset specialization when year level changes
  useEffect(() => {
    // Check if current specialization is valid for selected year level
    const validSpecializations = getFilteredSpecializations().map(
      (spec) => spec.value
    );
    if (!validSpecializations.includes(filters.specialization)) {
      setFilters((prev) => ({ ...prev, specialization: "" }));
    }
  }, [filters.yearLevel]);

  // Fetch list of resources
  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/resources");
      setResources(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching resources:", err);
      setError(t("resourceViewer.errors.loadFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Apply filters to resources
  const filteredResources = resources.filter((resource) => {
    return (
      (filters.subject === "" || resource.subject === filters.subject) &&
      (filters.yearLevel === "" ||
        resource.yearLevel === filters.yearLevel ||
        resource.yearLevel === "all") &&
      (filters.specialization === "" ||
        resource.specialization === filters.specialization ||
        resource.specialization === "all")
    );
  });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(t("locale"), {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };


  // Get label for year level based on value
  const getYearLevelLabel = (value) => {
    const yearLevel = yearLevels.find((yl) => yl.value === value);
    return yearLevel ? yearLevel.label : value;
  };

  // Get label for specialization based on value
  const getSpecializationLabel = (value) => {
    const specialization = allSpecializations.find((s) => s.value === value);
    return specialization ? specialization.label : value;
  };

  // View resource in PDF viewer
  const viewResource = (resource) => {
    setSelectedResource(resource);
  };

  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Close PDF viewer
  const closeViewer = () => {
    setSelectedResource(null);
    setIsFullScreen(false);
  };

  // If a PDF is being viewed in fullscreen, only show the PDF viewer
  if (selectedResource && isFullScreen) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
          <h3 className="text-lg font-medium truncate">
            {selectedResource.title}
          </h3>
          <div className="flex items-center space-x-4">
            <a
              href={`/api/resources/${selectedResource.id}/download`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-teal-300 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {t("common.download")}
            </a>
            <button
              onClick={toggleFullScreen}
              className="text-white hover:text-green-300 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5"
                />
              </svg>
              {t("resourceViewer.exitFullScreen")}
            </button>
            <button
              onClick={closeViewer}
              className="text-white hover:text-red-300 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              {t("common.close")}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe
            src={`/api/resources/${selectedResource.id}/view`}
            className="w-full h-full"
            title={selectedResource.title}
          ></iframe>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        {t("resourceViewer.title")}
      </h2>

      {/* Filters */}
      <div className="mb-6 bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-700 mb-3">
          {t("resourceViewer.filterResources")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("resourceViewer.filters.subject")}
            </label>
            <select
              id="subject"
              name="subject"
              value={filters.subject}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              {subjects.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="yearLevel"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("resourceViewer.filters.yearLevel")}
            </label>
            <select
              id="yearLevel"
              name="yearLevel"
              value={filters.yearLevel}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              {yearLevels.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="specialization"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("resourceViewer.filters.specialization")}
            </label>
            <select
              id="specialization"
              name="specialization"
              value={filters.specialization}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              {getFilteredSpecializations().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* AlloSchool Links Section: */}
      <div className="mb-6 bg-blue-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-blue-800 mb-3">
          {t("resourceViewer.alloSchoolResources")}
        </h3>

        {filters.yearLevel &&
        filters.subject &&
        filters.specialization &&
        getAlloSchoolLink() ? (
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <a
              href={getAlloSchoolLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {t("resourceViewer.alloSchoolResourcesFor", {
                subject: filters.subject,
                yearLevel: getYearLevelLabel(filters.yearLevel),
                specialization: getSpecializationLabel(filters.specialization),
              })}
            </a>
          </div>
        ) : filters.yearLevel && filters.subject && filters.specialization ? (
          <p className="text-gray-600">
            {t("resourceViewer.noAlloSchoolResources")}
          </p>
        ) : (
          <p className="text-gray-600">
            {t("resourceViewer.selectToViewAlloSchool")}
          </p>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* PDF Viewer Modal (non-fullscreen mode) */}
      {selectedResource && !isFullScreen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-2">
          <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b p-3">
              <h3 className="text-lg font-medium truncate">
                {selectedResource.title}
              </h3>
              <div className="flex items-center space-x-4">
                <a
                  href={`/api/resources/${selectedResource.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#18bebc] flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  {t("common.download")}
                </a>
                <button
                  onClick={toggleFullScreen}
                  className="text-gray-600 hover:text-green-600 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5"
                    />
                  </svg>
                  {t("resourceViewer.fullScreen")}
                </button>
                <button
                  onClick={closeViewer}
                  className="text-gray-600 hover:text-red-600 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  {t("common.close")}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={`/api/resources/${selectedResource.id}/view`}
                className="w-full h-full"
                title={selectedResource.title}
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Resources list */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400"></div>
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("resourceViewer.table.title")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("resourceViewer.table.subject")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("resourceViewer.table.yearLevel")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("resourceViewer.table.specialization")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("resourceViewer.table.uploaded")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("resourceViewer.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResources.map((resource) => {
                // Get AlloSchool link for this resource
                const alloSchoolLink =
                  resource.yearLevel &&
                  resource.subject &&
                  resource.specialization &&
                  alloSchoolLinks[resource.yearLevel]?.[resource.subject]?.[
                    resource.specialization
                  ];

                return (
                  <tr key={resource.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {resource.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {resource.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {getYearLevelLabel(resource.yearLevel)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {getSpecializationLabel(resource.specialization)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(resource.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewResource(resource)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        {t("common.view")}
                      </button>
                      <a
                        href={`/api/resources/${resource.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#18bebc] hover:text-teal-900 mr-3"
                      >
                        {t("common.download")}
                      </a>
                      {alloSchoolLink && (
                        <a
                          href={alloSchoolLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {t("resourceViewer.alloSchool")}
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-gray-500">
            {t("resourceViewer.noResourcesFound")}
          </p>
        </div>
      )}
    </div>
  );
}
