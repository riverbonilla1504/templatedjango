"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, UserPlus, Users, User, Calendar, Mail, Edit, Trash2, Plus, CheckCircle, AlertCircle, Loader, Save } from 'lucide-react';

// Definición del tipo para una persona
interface Person {
  id: number;
  name: string;
  lastname: string;
  age: number;
  email: string;
}

// Definición del tipo para el formulario
interface FormData {
  name: string;
  lastname: string;
  age: string;
  email: string;
}

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/person';

export default function PersonsManagement() {
  // Estados para manejar la lista de personas y la persona seleccionada
  const [persons, setPersons] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Estado para el formulario
  const [formData, setFormData] = useState<FormData>({
    name: '',
    lastname: '',
    age: '',
    email: ''
  });

  // Cargar todas las personas al montar el componente
  useEffect(() => {
    fetchPersons();
  }, []);

  // Función para obtener todas las personas
  const fetchPersons = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/`);
      setPersons(response.data.persons || []);
    } catch (error) {
      setError('Error al cargar personas');
      console.error('Error fetching persons:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar una persona por nombre
  const searchPerson = async () => {
    if (!searchName.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/get/${searchName}/`);
      if (response.data.person && response.data.person.length > 0) {
        setPersons(response.data.person);
      } else {
        setError('No se encontraron personas con ese nombre');
        setPersons([]);
      }
    } catch (error) {
      setError('Error al buscar la persona');
      console.error('Error searching person:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para crear una nueva persona
  const createPerson = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const personData = {
        name: formData.name,
        lastname: formData.lastname,
        age: parseInt(formData.age),
        email: formData.email
      };
      
      const response = await axios.post(`${API_URL}/create/`, personData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.status === 201) {
        setSuccess('Persona creada exitosamente');
        resetForm();
        fetchPersons();
        setTimeout(() => setShowForm(false), 1000);
      } else {
        setError('Error al crear la persona: ' + JSON.stringify(response.data));
      }
    } catch (error) {
      setError(`Error al crear la persona: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
      console.error('Error creating person:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar una persona
  const updatePerson = async () => {
    if (!selectedPerson) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const personData = {
        name: formData.name,
        lastname: formData.lastname,
        age: parseInt(formData.age),
        email: formData.email
      };
      
      await axios.put(`${API_URL}/update/${selectedPerson.id}/`, personData);
      setSelectedPerson(null);
      setSuccess('Persona actualizada exitosamente');
      resetForm();
      fetchPersons();
      setTimeout(() => setShowForm(false), 1000);
    } catch (error) {
      setError(`Error al actualizar la persona: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
      console.error('Error updating person:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar una persona
  const deletePerson = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta persona?')) return;
    
    setLoading(true);
    setError('');
    
    try {
      await axios.delete(`${API_URL}/delete/${id}/`);
      setSuccess('Persona eliminada exitosamente');
      fetchPersons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error al eliminar la persona');
      console.error('Error deleting person:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para seleccionar una persona para editar
  const selectPersonForEdit = (person: Person) => {
    setSelectedPerson(person);
    setFormData({
      name: person.name,
      lastname: person.lastname,
      age: person.age.toString(),
      email: person.email
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      name: '',
      lastname: '',
      age: '',
      email: ''
    });
    setSelectedPerson(null);
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPerson) {
      updatePerson();
    } else {
      createPerson();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-indigo-800 tracking-tight">
        Sistema de Gestión de Personas
      </h1>
      
      {/* Panel principal con sombra y fondo */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
        {/* Cabecera del panel */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
          <h2 className="text-xl font-semibold">Panel de Control</h2>
        </div>
        
        {/* Contenido del panel */}
        <div className="p-6">
          {/* Sección de búsqueda */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Buscar Persona</h3>
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Introduce el nombre a buscar"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <button 
                onClick={searchPerson}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Buscar
              </button>
              <button 
                onClick={fetchPersons}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Ver Todos
              </button>
            </div>
          </div>
          
          {/* Botón para mostrar/ocultar formulario */}
          {!showForm ? (
            <div className="mb-8 text-center">
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Plus className="w-5 h-5 mr-2" />
                Añadir Nueva Persona
              </button>
            </div>
          ) : null}
          
          {/* Mensajes de estado */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md animate-fadeIn">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md animate-fadeIn">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>{success}</span>
              </div>
            </div>
          )}
          
          {loading && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-md flex items-center animate-pulse">
              <Loader className="animate-spin h-5 w-5 text-blue-500 mr-3" />
              <span>Procesando solicitud...</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Formulario para crear/editar (solo se muestra cuando showForm es true) */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8 transform transition-all duration-300">
          <div className={`bg-gradient-to-r ${selectedPerson ? 'from-yellow-500 to-amber-600' : 'from-green-600 to-emerald-600'} p-4 text-white`}>
            <h2 className="text-xl font-semibold flex items-center">
              {selectedPerson ? (
                <>
                  <Edit className="w-5 h-5 mr-2" />
                  Editar Persona
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Crear Nueva Persona
                </>
              )}
            </h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Nombre"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Apellido"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Edad"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  type="submit"
                  className={`flex-1 md:flex-none inline-flex items-center justify-center px-8 py-3 rounded-lg text-white font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    selectedPerson 
                      ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500' 
                      : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  }`}
                  disabled={loading}
                >
                  {selectedPerson ? (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Actualizar Persona
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Crear Persona
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="flex-1 md:flex-none px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Lista de personas */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-white">
          <h2 className="text-xl font-semibold flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Listado de Personas
          </h2>
        </div>
        
        <div className="p-6">
          {persons.length === 0 && !loading ? (
            <div className="text-center p-10 bg-gray-50 rounded-lg">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-700">No hay personas</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron personas para mostrar.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Añadir persona
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {persons.map(person => (
                <div key={person.id} className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b">
                    <h3 className="font-semibold text-lg text-gray-800 truncate">{person.name} {person.lastname}</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm">ID: {person.id}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm">Edad: {person.age} años</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm truncate">{person.email}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between space-x-2">
                      <button
                        onClick={() => selectPersonForEdit(person)}
                        className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => deletePerson(person.id)}
                        className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}