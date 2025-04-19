import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

interface Payment {
  id: string;
  tenant: string;
  property: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  method: string;
}

const mockPayments: Payment[] = [
  {
    id: '1',
    tenant: 'John Doe',
    property: 'Sunset Apartments',
    amount: 1200,
    date: '2024-03-01',
    status: 'Paid',
    method: 'Bank Transfer',
  },
  {
    id: '2',
    tenant: 'Jane Smith',
    property: 'Mountain View House',
    amount: 2000,
    date: '2024-03-05',
    status: 'Pending',
    method: 'Credit Card',
  },
  {
    id: '3',
    tenant: 'Bob Johnson',
    property: 'Downtown Loft',
    amount: 900,
    date: '2024-02-28',
    status: 'Overdue',
    method: 'Cash',
  },
];

const getStatusColor = (status: Payment['status']) => {
  switch (status) {
    case 'Paid':
      return 'success';
    case 'Pending':
      return 'warning';
    case 'Overdue':
      return 'error';
    default:
      return 'default';
  }
};

const Payments: React.FC = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Payments</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          color="primary"
        >
          Record Payment
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tenant</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Method</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.tenant}</TableCell>
                <TableCell>{payment.property}</TableCell>
                <TableCell>${payment.amount}</TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell>
                  <Chip
                    label={payment.status}
                    color={getStatusColor(payment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" size="small">
                    <ReceiptIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Payments; 