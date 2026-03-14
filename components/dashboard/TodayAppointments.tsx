import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const appointments = [
  {
    time: "09:00",
    patient: "John Doe",
    provider: "Dr. Sarah Johnson",
    status: "Confirmed"
  },
  {
    time: "10:30",
    patient: "Emily Davis",
    provider: "Dr. Michael Lee",
    status: "Ready"
  },
  {
    time: "12:15",
    patient: "Robert Wilson",
    provider: "Dr. Sarah Johnson",
    status: "Pending"
  },
  {
    time: "14:45",
    patient: "Jane Smith",
    provider: "Dr. Michael Lee",
    status: "Completed"
  }
];

export function TodayAppointments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today’s Appointments</CardTitle>
        <CardDescription>Live clinic schedule and patient status.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((row) => (
              <TableRow key={`${row.time}-${row.patient}`}>
                <TableCell>{row.time}</TableCell>
                <TableCell>{row.patient}</TableCell>
                <TableCell>{row.provider}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      row.status === "Completed"
                        ? "success"
                        : row.status === "Pending"
                          ? "warning"
                          : "default"
                    }
                  >
                    {row.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
