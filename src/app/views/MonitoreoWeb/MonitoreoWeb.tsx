import { useEffect, useState } from "react";
import ButtonsAdd from "../componentes/ButtonsAdd";
import TitleComponent from "../componentes/TitleComponent";
import { MonitoreoWebModal } from "./MonitoreoWebModal";
import MUIXDataGrid from "../MUIXDataGrid";
import { PERMISO, USUARIORESPONSE } from "../../interfaces/UserInfo";
import { getPermisos, getUser } from "../../services/localStorage";
import { TipoAccion } from "../CatTipoAccion/TipoAccion";
import ButtonsEdit from "../componentes/ButtonsEdit";
import ButtonsDeleted from "../componentes/ButtonsDeleted";
import Swal from "sweetalert2";
import { Toast } from "../../helpers/Toast";
import { CatalogosServices } from "../../services/catalogosServices";
import { GridColDef } from "@mui/x-data-grid";

export const MonitoreoWeb = () => {
    const [openSlider, setOpenSlider] = useState(true);
    const [modo, setModo] = useState("");
    const [open, setOpen] = useState(false);
    const [tipoOperacion, setTipoOperacion] = useState(0);
    const [vrows, setVrows] = useState({});
    const [datos, setDatos] = useState([]);
    const permisos: PERMISO[] = JSON.parse(String(getPermisos()));
    const user: USUARIORESPONSE = JSON.parse(String(getUser()));

    const [agregar, setAgregar] = useState<boolean>(false);
    const [editar, setEditar] = useState<boolean>(false);
    const [eliminar, setEliminar] = useState<boolean>(false);

    const handleAccion = (v: any) => {
        if (v.tipo == 1) {
          setTipoOperacion(2);
          setModo("Editar Registro");
          setOpen(true);
          setVrows(v.data);
        } else if (v.tipo === 2) {
          Swal.fire({
            icon: "info",
            title: "¿Estás seguro de eliminar este registro?",
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: "Confirmar",
            denyButtonText: `Cancelar`,
          }).then((result) => {
            if (result.isConfirmed) {
              let data = {
                NUMOPERACION: 3,
                CHID: v.data.row.id,
                CHUSER: user.Id,
              };
    
              CatalogosServices.Monitoreo_index(data).then((res) => {
                if (res.SUCCESS) {
                  Toast.fire({
                    icon: "success",
                    title: "¡Registro Eliminado!",
                  });
                  consulta({ NUMOPERACION: 4 });
                } else {
                  Swal.fire("¡Error!", res.STRMESSAGE, "error");
                }
              });
            } else if (result.isDenied) {
              Swal.fire("No se realizaron cambios", "", "info");
            }
          });
        }
    };

    const handleClose = () => {
        setOpen(false);
        consulta({ NUMOPERACION: 4 });
    };

    const handleOpen = (v: any) => {
        setTipoOperacion(1);
        setModo("Agregar Registro");
        setOpen(true);
        setVrows("");
    };

    const columns: GridColDef[] = [
        {
          field: "id",
          headerName: "Identificador",
          width: 150,
        },
        { field: "Url", headerName: "URL", width: 350 },
        { field: "Correos", headerName: "Correos", width: 350 },
        { field: "Alias", headerName: "Alias", width: 200 },
        { field: "Tiempo", headerName: "Tiempo", width: 100 },
        { field: "UltimaEjecucion", headerName: "Ultima Ejecucion", width: 200 },




        {
          field: "acciones",
          disableExport: true,
          headerName: eliminar || editar ? "Acciones": "",
          description: eliminar || editar ? "Campo de Acciones": "",
          sortable: false,
          //width: 200,
          width: eliminar || editar ? 200 : 0,
          renderCell: (v) => {
            return (
              <>
                {editar ? (
                  <ButtonsEdit
                    handleAccion={handleAccion}
                    row={v}
                    show={editar}
                  ></ButtonsEdit>
                ) : (""
                )}
                {eliminar ? (
                  <ButtonsDeleted
                    handleAccion={handleAccion}
                    row={v}
                    show={eliminar}
                  ></ButtonsDeleted>
                ) : (""
                )}
    
              </>
            );
          },
        },
        { field: "FechaCreacion", headerName: "Fecha de Creación", width: 150 },
        {
          field: "UltimaActualizacion",
          headerName: "Última Actualización",
          width: 150,
        },
        { field: "creado", headerName: "Creado Por", width: 200 },
        { field: "modi", headerName: "Modificado Por", width: 200 },
      
    ];

    const consulta = (data: any) => {
        CatalogosServices.Monitoreo_index(data).then((res) => {
          if (res.SUCCESS) {
            setDatos(res.RESPONSE);
            setOpenSlider(false);
          } else {
            setOpenSlider(false);
            Swal.fire("¡Error!", res.STRMESSAGE, "error");
          }
        });
    };

    useEffect(() => {
    permisos.map((item: PERMISO) => {
      if (String(item.menu) === "MONITOREO") {
        if (String(item.ControlInterno) === "AGREG") {
          setAgregar(true);
        }
        if (String(item.ControlInterno) === "ELIM") {
          setEliminar(true);
        }
        if (String(item.ControlInterno) === "EDIT") {
          setEditar(true);
        }
      }
    });
    consulta({ NUMOPERACION: 4 });
    }, []);




    return (<div style={{ height: 600, width: "100%", padding: "1%" }}>
        {open ? (
            <MonitoreoWebModal
                open={open}
                tipo={tipoOperacion}
                handleClose={handleClose}
                dt={vrows}
            />
        ) : (
            ""
        )}

        <TitleComponent title={"Monitoreo Web"} show={openSlider} />
        {agregar ? (
            <ButtonsAdd
                handleOpen={handleOpen}
                agregar={agregar}
            />
        ) : (""
        )}

        <MUIXDataGrid columns={columns} rows={datos} />
    </div>);
}