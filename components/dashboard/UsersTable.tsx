"use client";

import { useState } from "react";
import UserRoleRow from "@/components/dashboard/UserRoleRow";
import DataPagination from "@/components/dashboard/DataPagination";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 20;

interface UsersTableProps {
  users: any[];
  currentUserPermissions: number;
  roles: any[];
  teams: any[];
}

export default function UsersTable({
  users,
  currentUserPermissions,
  roles,
  teams,
}: UsersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Roles & Teams</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedUsers.map((user: any) => (
            <UserRoleRow
              key={user._id.toString()}
              user={{ ...user, _id: user._id.toString() }}
              currentUserPermissions={currentUserPermissions}
              roles={roles}
              teams={teams}
            />
          ))}
        </TableBody>
      </Table>
      <DataPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={users.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
