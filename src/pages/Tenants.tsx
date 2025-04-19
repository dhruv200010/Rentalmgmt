import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  property: string;
  rent: number;
  status: 'Active' | 'Inactive';
}

const mockTenants: Tenant[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    property: 'Sunset Apartments',
    rent: 1200,
    status: 'Active',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '(555) 987-6543',
    property: 'Mountain View House',
    rent: 2000,
    status: 'Active',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '(555) 456-7890',
    property: 'Downtown Loft',
    rent: 900,
    status: 'Inactive',
  },
];

const mockProperties = [
  'Sunset Apartments',
  'Mountain View House',
  'Downtown Loft',
];

const Tenants: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState<Omit<Tenant, 'id'>>({
    name: '',
    email: '',
    phone: '',
    property: '',
    rent: 0,
    status: 'Active',
  });

  const handleOpenDialog = (tenant?: Tenant) => {
    if (tenant) {
      setEditingTenant(tenant);
      setFormData({
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        property: tenant.property,
        rent: tenant.rent,
        status: tenant.status,
      });
    } else {
      setEditingTenant(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        property: '',
        rent: 0,
        status: 'Active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTenant(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rent' ? Number(value) : value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = () => {
    if (editingTenant) {
      setTenants(prev =>
        prev.map(tenant =>
          tenant.id === editingTenant.id
            ? { ...tenant, ...formData }
            : tenant
        )
      );
    } else {
      const newTenant: Tenant = {
        ...formData,
        id: String(tenants.length + 1),
      };
      setTenants(prev => [...prev, newTenant]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setTenants(prev => prev.filter(tenant => tenant.id !== id));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Tenants</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add Tenant
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Rent</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>{tenant.name}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{tenant.email}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {tenant.phone}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{tenant.property}</TableCell>
                <TableCell>${tenant.rent}</TableCell>
                <TableCell>
                  <Chip
                    label={tenant.status}
                    color={tenant.status === 'Active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    color="primary" 
                    size="small"
                    onClick={() => handleOpenDialog(tenant)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    size="small"
                    onClick={() => handleDelete(tenant.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Property</InputLabel>
              <Select
                name="property"
                value={formData.property}
                onChange={handleSelectChange}
                label="Property"
              >
                {mockProperties.map((property) => (
                  <MenuItem key={property} value={property}>
                    {property}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Rent"
              name="rent"
              type="number"
              value={formData.rent}
              onChange={handleInputChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleSelectChange}
                label="Status"
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingTenant ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tenants; 