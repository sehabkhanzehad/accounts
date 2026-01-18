import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { ManagementGroupLeaderTable } from './components/ManagementGroupLeaderTable'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Users, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import GroupLeaderCollectionModal from './components/GroupLeaderCollectionModal'

export default function ManagementGroupLeaders() {
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(25)
    const [collectionModalOpen, setCollectionModalOpen] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['management-group-leaders', currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get('/group-leaders', {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage,
                }
            })
            return response.data
        }
    })

    const groupLeaders = data?.data
    const meta = data?.meta

    const handleCollection = () => {
        setCollectionModalOpen(true)
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-end justify-between">
                    <PageHeading
                        title={`Group Leaders (${meta?.total || 0})`}
                        description="Group leaders for pilgrim management"
                    />
                    <Button
                        onClick={handleCollection}
                        className="flex items-center gap-2"
                    >
                        <Receipt className="h-4 w-4" />
                        Collection
                    </Button>
                </div>

                <div className="flex-1">
                    {isLoading ? (
                        <TableSkeletons />
                    ) : groupLeaders?.length > 0 ? (
                        <ManagementGroupLeaderTable
                            groupLeaders={groupLeaders}
                        />
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
        </DashboardLayout>
    )
}