import AppPagination from "@/components/app/AppPagination";
import { EmptyComponent } from "@/components/app/EmptyComponent";
import PageHeading from "@/components/PageHeading";
import TableSkeletons from "@/components/skeletons/TableSkeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/Layouts/DashboardLayout";
import api from "@/lib/api";
import { debounce } from "@/lib/shared";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, Receipt, Search, Users } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import GroupLeaderCollectionModal from "./components/GroupLeaderCollectionModal";
import GroupLeaderUmrahCollectionModal from "./components/GroupLeaderUmrahCollectionModal";
import { ManagementGroupLeaderTable } from "./components/ManagementGroupLeaderTable";

export default function ManagementGroupLeaders() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [umrahCollectionModalOpen, setUmrahCollectionModalOpen] =
    useState(false);

  // Create debounced function once with useRef and useCallback
  const debouncedSearchRef = useRef(
    debounce((value) => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 500),
  );

  const handleSearch = useCallback((event) => {
    setSearch(event.target.value);
    debouncedSearchRef.current(event.target.value);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: [
      "management-group-leaders",
      currentPage,
      rowsPerPage,
      debouncedSearch,
    ],
    queryFn: async () => {
      const response = await api.get("/group-leaders", {
        params: {
          page: currentPage,
          per_page: rowsPerPage,
          search: debouncedSearch || undefined,
        },
      });
      return response.data;
    },
  });

  const groupLeaders = data?.data;
  const meta = data?.meta;

  const handleCollection = () => {
    setCollectionModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-4">
        <div className="flex items-end justify-between">
          <PageHeading
            title={`Group Leaders (${meta?.total || 0})`}
            description="Group leaders for pilgrim management"
          />

          <div className="flex gap-2">
            <Button
              onClick={() => setUmrahCollectionModalOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Receipt className="h-4 w-4" /> Umrah Collection
            </Button>

            <Button
              onClick={() => setCollectionModalOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Receipt className="h-4 w-4" /> Hajj Collection
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by full name, bangla name, phone, group name"
              value={search}
              onChange={handleSearch}
              className="pl-10 max-w-lg"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* <Button
              variant="outline"
              onClick={() => toast.info("Coming soon")}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button> */}
            <Button
              variant="outline"
              onClick={() => toast.info("Coming soon")}
              className="gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              Sort
            </Button>
          </div>
        </div>
        <div className="flex-1">
          {isLoading ? (
            <TableSkeletons />
          ) : groupLeaders?.length > 0 ? (
            <ManagementGroupLeaderTable groupLeaders={groupLeaders} />
          ) : (
            <EmptyComponent
              icon={<Users />}
              title="No group leaders found"
              description="No group leaders are available"
            />
          )}
        </div>

        {meta && (
          <AppPagination
            meta={meta}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>

      {collectionModalOpen && (
        <GroupLeaderCollectionModal
          open={collectionModalOpen}
          onOpenChange={setCollectionModalOpen}
        />
      )}

      {umrahCollectionModalOpen && (
        <GroupLeaderUmrahCollectionModal
          open={umrahCollectionModalOpen}
          onOpenChange={setUmrahCollectionModalOpen}
        />
      )}
    </DashboardLayout>
  );
}
