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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  rent: number;
  status: string;
}

const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Sunset Apartments',
    address: '123 Main St, City',
    type: 'Apartment',
    rent: 1200,
    status: 'Occupied',
  },
  {
    id: '2',
    name: 'Mountain View House',
    address: '456 Oak Ave, Town',
    type: 'House',
    rent: 2000,
    status: 'Vacant',
  },
  {
    id: '3',
    name: 'Downtown Loft',
    address: '789 Pine St, City',
    type: 'Studio',
    rent: 900,
    status: 'Occupied',
  },
];

const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<Omit<Property, 'id'>>({
    name: '',
    address: '',
    type: '',
    rent: 0,
    status: 'Vacant',
  });

  const handleOpenDialog = (property?: Property) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        name: property.name,
        address: property.address,
        type: property.type,
        rent: property.rent,
        status: property.status,
      });
    } else {
      setEditingProperty(null);
      setFormData({
        name: '',
        address: '',
        type: '',
        rent: 0,
        status: 'Vacant',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProperty(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rent' ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    if (editingProperty) {
      setProperties(prev =>
        prev.map(prop =>
          prop.id === editingProperty.id
            ? { ...prop, ...formData }
            : prop
        )
      );
    } else {
      const newProperty: Property = {
        ...formData,
        id: String(properties.length + 1),
      };
      setProperties(prev => [...prev, newProperty]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setProperties(prev => prev.filter(prop => prop.id !== id));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Properties</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add Property
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Rent</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell>{property.name}</TableCell>
                <TableCell>{property.address}</TableCell>
                <TableCell>{property.type}</TableCell>
                <TableCell>${property.rent}</TableCell>
                <TableCell>{property.status}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    color="primary" 
                    size="small"
                    onClick={() => handleOpenDialog(property)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    size="small"
                    onClick={() => handleDelete(property.id)}
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
          {editingProperty ? 'Edit Property' : 'Add New Property'}
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
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Rent"
              name="rent"
              type="number"
              value={formData.rent}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingProperty ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Properties; 