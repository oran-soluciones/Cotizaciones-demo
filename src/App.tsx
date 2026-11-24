import { Navigate, Route, Routes } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ProveedorDatos } from "@/lib/store"
import Catalogo from "@/pages/Catalogo"
import CatalogoForm from "@/pages/CatalogoForm"
import ClienteDetalle from "@/pages/ClienteDetalle"
import ClienteForm from "@/pages/ClienteForm"
import Clientes from "@/pages/Clientes"
import ComisionDetalle from "@/pages/ComisionDetalle"
import ComisionForm from "@/pages/ComisionForm"
import Comisiones from "@/pages/Comisiones"
import CotizacionDetalle from "@/pages/CotizacionDetalle"
import CotizacionForm from "@/pages/CotizacionForm"
import Cotizaciones from "@/pages/Cotizaciones"
import Dashboard from "@/pages/Dashboard"
import PersonalDetalle from "@/pages/PersonalDetalle"
import PersonalForm from "@/pages/PersonalForm"
import PersonalPage from "@/pages/Personal"
import ServicioDetalle from "@/pages/ServicioDetalle"
import ServicioForm from "@/pages/ServicioForm"
import Servicios from "@/pages/Servicios"
import VehiculoDetalle from "@/pages/VehiculoDetalle"
import VehiculoForm from "@/pages/VehiculoForm"
import Vehiculos from "@/pages/Vehiculos"

export default function App() {
  return (
    <ProveedorDatos>
      <TooltipProvider delayDuration={250}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="clientes/nuevo" element={<ClienteForm />} />
            <Route path="clientes/:id/editar" element={<ClienteForm />} />
            <Route path="clientes/:id" element={<ClienteDetalle />} />
            <Route path="vehiculos" element={<Vehiculos />} />
            <Route path="vehiculos/nuevo" element={<VehiculoForm />} />
            <Route path="vehiculos/:id/editar" element={<VehiculoForm />} />
            <Route path="vehiculos/:id" element={<VehiculoDetalle />} />
            <Route path="catalogo" element={<Catalogo />} />
            <Route path="catalogo/nuevo" element={<CatalogoForm />} />
            <Route path="catalogo/:id/editar" element={<CatalogoForm />} />
            <Route path="cotizaciones" element={<Cotizaciones />} />
            <Route path="cotizaciones/nuevo" element={<CotizacionForm />} />
            <Route path="cotizaciones/:id/editar" element={<CotizacionForm />} />
            <Route path="cotizaciones/:id" element={<CotizacionDetalle />} />
            <Route path="servicios" element={<Servicios />} />
            <Route path="servicios/nuevo" element={<ServicioForm />} />
            <Route path="servicios/:id/editar" element={<ServicioForm />} />
            <Route path="servicios/:id" element={<ServicioDetalle />} />
            <Route path="personal" element={<PersonalPage />} />
            <Route path="personal/nuevo" element={<PersonalForm />} />
            <Route path="personal/:id/editar" element={<PersonalForm />} />
            <Route path="personal/:id" element={<PersonalDetalle />} />
            <Route path="comisiones" element={<Comisiones />} />
            <Route path="comisiones/nuevo" element={<ComisionForm />} />
            <Route path="comisiones/:id/editar" element={<ComisionForm />} />
            <Route path="comisiones/:id" element={<ComisionDetalle />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster position="bottom-right" richColors closeButton />
      </TooltipProvider>
    </ProveedorDatos>
  )
}
