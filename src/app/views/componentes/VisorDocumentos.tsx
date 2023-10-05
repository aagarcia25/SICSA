import React, { useEffect, useState } from "react";
import DownloadingIcon from "@mui/icons-material/Downloading";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import {
  DialogContent,
  Grid,
  IconButton,
  ToggleButton,
  Typography,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import axios from "axios";
import Swal from "sweetalert2";
import { base64ToArrayBuffer } from "../../helpers/Files";
import { Toast } from "../../helpers/Toast";
import { PERMISO, USUARIORESPONSE } from "../../interfaces/UserInfo";
import { AuditoriaService } from "../../services/AuditoriaService";
import { getPermisos, getToken, getUser } from "../../services/localStorage";
import MUIXDataGrid from "../MUIXDataGrid";
import Progress from "../Progress";
import ButtonsDeleted from "./ButtonsDeleted";
import { ButtonsDetail } from "./ButtonsDetail";
import { TooltipPersonalizado } from "./CustomizedTooltips";
import ModalForm from "./ModalForm";
import ChecklistRtlIcon from "@mui/icons-material/ChecklistRtl";
import InsightsIcon from "@mui/icons-material/Insights";
import Trazabilidad from "./Trazabilidad";
const VisorDocumentos = ({
  handleFunction,
  obj,
  tipo,
}: {
  handleFunction: Function;
  obj: any;
  tipo: number;
}) => {
  const [openSlider, setOpenSlider] = useState(false);
  const [open, setOpen] = useState(false);
  const [verarchivo, setverarchivo] = useState(false);

  const [verTrazabilidad, setVerTrazabilidad] = useState(false);

  const [openModalDetalle, setOpenModalDetalle] = useState(false);
  const [vrows, setVrows] = useState({});
  const [data, setData] = useState([]);
  const [URLruta, setURLRuta] = useState<string>("");

  const user: USUARIORESPONSE = JSON.parse(String(getUser()));
  const permisos: PERMISO[] = JSON.parse(String(getPermisos()));
  const [agregar, setAgregar] = useState<boolean>(false);
  const [editar, setEditar] = useState<boolean>(false);
  const [eliminar, setEliminar] = useState<boolean>(false);

  const consulta = () => {
    let data = {
      NUMOPERACION: 4,
      P_IDAUDITORIA: obj.id,
      TOKEN: JSON.parse(String(getToken())),
    };

    AuditoriaService.Filesindex(data).then((res) => {
      if (res.SUCCESS) {
        Toast.fire({
          icon: "success",
          title: "¡Consulta Exitosa!",
        });
        setData(res.RESPONSE);
        setOpenSlider(false);
      } else {
        setOpenSlider(false);
        Swal.fire("¡Error!", res.STRMESSAGE, "error");
      }
    });
  };

  const ProcesaSPeis = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOpenSlider(true);
    let count = 0;
    let encontrados: any[] = [];
    let counfiles = event?.target?.files?.length;
    let peticiones: any[] = [];

    //Recorremos los registros de la busqueda
    for (let i = 0; i < Number(counfiles); i++) {
      let file = event?.target?.files?.[i] || "";
      let namefile = event?.target?.files?.[i].name || "";
      encontrados.push({ Archivo: file, NOMBRE: namefile });
    }

    encontrados.map((item: any) => {
      const formData = new FormData();
      formData.append("TIPO", String(tipo));
      formData.append("NUMOPERACION", "1");
      formData.append("ID", obj.id);
      formData.append("CHUSER", user.Id);
      formData.append("TOKEN", JSON.parse(String(getToken())));
      formData.append("FILE", item.Archivo, item.NOMBRE);
      console.log(item.Archivo);
      let p = axios.post(
        process.env.REACT_APP_APPLICATION_BASE_URL + "Filesindex",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-Requested-With": "XMLHttpRequest",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      peticiones.push(p);
    });

    axios.all(peticiones).then((resposeArr) => {
      resposeArr.map((item) => {
        if (item.data.SUCCESS) {
          count++;
        } else {
          count--;
        }
      });

      if (count == 0 || count == -1) {
        Swal.fire("¡Error!", "No se Realizo la Operación", "error");
        setOpenSlider(false);
      } else {
        Swal.fire({
          icon: "success",
          title: "Información",
          text: "Archivos Subidos " + count,
          confirmButtonText: "Ok",
        }).then((result) => {
          if (result.isConfirmed) {
            setOpenSlider(false);
            consulta();
          }
        });
      }
    });
  };

  const handletrazabilidad = (v: any) => {
    setVrows(v);
    setVerTrazabilidad(true);
  };

  const handleVerificarArchivo = (v: any) => {
    Swal.fire({
      icon: "info",
      title: "¿Estás seguro Verificar el Archivo?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Confirmar",
      denyButtonText: `Cancelar`,
    }).then((result) => {
      if (result.isConfirmed) {
        let data = {
          NUMOPERACION: 6,
          CHID: v.id,
          CHUSER: user.Id,
        };
        setOpenSlider(true);
        AuditoriaService.Filesindex(data).then((res) => {
          if (res.SUCCESS) {
            Toast.fire({
              icon: "success",
              title: "¡Registro Verificado!",
            });
            consulta();
            setOpenSlider(false);
          } else {
            Swal.fire("¡Error!", res.STRMESSAGE, "error");
            setOpenSlider(false);
          }
        });
      } else if (result.isDenied) {
        Swal.fire("No se realizaron cambios", "", "info");
        setOpenSlider(false);
      }
    });
  };
  const handleDescargarFile = (v: any) => {
    setOpenSlider(true);
    let data = {
      NUMOPERACION: 5,
      P_ROUTE: v.row.Route,
      TOKEN: JSON.parse(String(getToken())),
    };

    AuditoriaService.Filesindex(data).then((res) => {
      if (res.SUCCESS) {
        console.log(res);
        var bufferArray = base64ToArrayBuffer(String(res.RESPONSE.FILE));
        var blobStore = new Blob([bufferArray], { type: res.RESPONSE.TIPO });
        var data = window.URL.createObjectURL(blobStore);
        var link = document.createElement("a");
        document.body.appendChild(link);
        link.href = data;
        link.download = v.row.Nombre;
        link.click();
        window.URL.revokeObjectURL(data);
        link.remove();
        setOpenSlider(false);
      } else {
        setOpenSlider(false);
        Swal.fire("¡Error!", res.STRMESSAGE, "error");
      }
    });
  };

  const handleCloseModal = () => {
    setverarchivo(false);
    setVerTrazabilidad(false);
  };

  const handleVer = (v: any) => {
    setOpenSlider(true);
    let data = {
      NUMOPERACION: 5,
      P_ROUTE: v.row.Route,
      TOKEN: JSON.parse(String(getToken())),
    };

    AuditoriaService.Filesindex(data).then((res) => {
      if (res.SUCCESS) {
        var bufferArray = base64ToArrayBuffer(String(res.RESPONSE.FILE));
        var blobStore = new Blob([bufferArray], { type: res.RESPONSE.TIPO });
        var data = window.URL.createObjectURL(blobStore);
        var link = document.createElement("a");
        document.body.appendChild(link);
        link.href = data;
        setURLRuta(link.href);
        setOpenSlider(false);
        setverarchivo(true);
      } else {
        setOpenSlider(false);
        Swal.fire("¡Error!", res.STRMESSAGE, "error");
      }
    });
  };

  const handleAccion = (v: any) => {
    Swal.fire({
      icon: "info",
      title: "¿Estás seguro de eliminar este registro?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Confirmar",
      denyButtonText: `Cancelar`,
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(v);
        let data = {
          NUMOPERACION: 3,
          CHID: v.data.row.id,
          CHUSER: user.Id,
          P_ROUTE: v.data.row.Route,
          TOKEN: JSON.parse(String(getToken())),
        };

        AuditoriaService.Filesindex(data).then((res) => {
          if (res.SUCCESS) {
            Toast.fire({
              icon: "success",
              title: "¡Registro Eliminado!",
            });
            consulta();
          } else {
            Swal.fire("¡Error!", res.STRMESSAGE, "error");
          }
        });
      } else if (result.isDenied) {
        Swal.fire("No se realizaron cambios", "", "info");
      }
    });
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Identificador",
      width: 150,
    },

    {
      field: "Route",
      headerName: "Route",
      width: 150,
    },
    {
      field: "acciones",
      disableExport: true,
      headerName: "Acciones",
      description: "Campo de Acciones",
      sortable: false,
      width: 200,
      renderCell: (v) => {
        return (
          <>
            {String(v.row.estatus) !== "Verificado" ? (
              <ButtonsDeleted
                handleAccion={handleAccion}
                row={v}
                show={true}
              ></ButtonsDeleted>
            ) : (
              ""
            )}
            <ButtonsDetail
              title={"Ver"}
              handleFunction={handleVer}
              show={true}
              icon={<RemoveRedEyeIcon />}
              row={v}
            ></ButtonsDetail>
            <ButtonsDetail
              title={"Descargar"}
              handleFunction={handleDescargarFile}
              show={true}
              icon={<DownloadingIcon />}
              row={v}
            ></ButtonsDetail>
            {String(v.row.estatus) === "Pendiente de Verificación" ? (
              <ButtonsDetail
                title={"Verificar Archivo"}
                handleFunction={handleVerificarArchivo}
                show={true}
                icon={<ChecklistRtlIcon />}
                row={v}
              ></ButtonsDetail>
            ) : (
              ""
            )}

            <ButtonsDetail
              title={"Ver Trazabilidad"}
              handleFunction={handletrazabilidad}
              show={true}
              icon={<InsightsIcon />}
              row={v}
            ></ButtonsDetail>
          </>
        );
      },
    },
    {
      field: "estatus",
      description: "Estatus",
      headerName: "Estatus",
      width: 150,
    },
    { field: "FechaCreacion", headerName: "Fecha de Creación", width: 150 },
    {
      field: "UltimaActualizacion",
      headerName: "Última Actualización",
      width: 150,
    },
    { field: "creado", description: "Creado Por", headerName: "Creado Por", width: 150 },
    { field: "modi", description: "Modificado Por", headerName: "Modificado Por", width: 150 },
    { field: "Nombre", description: "Nombre", headerName: "Nombre", width: 250 },
  ];

  const handleOpen = (v: any) => {
    setOpen(true);
    setVrows("");
  };

  useEffect(() => {
    permisos.map((item: PERMISO) => {
      if (String(item.ControlInterno) === "AUDITOR") {
        if (String(item.Referencia) === "AGREG") {
          setAgregar(true);
        }
        if (String(item.Referencia) === "ELIM") {
          setEliminar(true);
        }
        if (String(item.Referencia) === "EDIT") {
          setEditar(true);
        }
      }
    });
    consulta();
  }, []);

  return (
    <div>
      <ModalForm title={"Visor de Documentos"} handleClose={handleFunction}>
        <Progress open={openSlider}></Progress>

        {true ? (
          <>
            <TooltipPersonalizado
              title={
                <React.Fragment>
                  <Typography color="inherit">Cargar Documentos</Typography>
                  {"Permite la carga de Documentos de Forma Masiva "}
                </React.Fragment>
              }
            >
              <ToggleButton value="check">
                <IconButton
                  color="primary"
                  aria-label="upload documento"
                  component="label"
                  size="small"
                >
                  <input
                    multiple
                    hidden
                    accept=".pdf"
                    type="file"
                    value=""
                    onChange={(v) => ProcesaSPeis(v)}
                  />
                  <FileUploadIcon />
                </IconButton>
              </ToggleButton>
            </TooltipPersonalizado>
          </>
        ) : (
          ""
        )}

        <MUIXDataGrid columns={columns} rows={data} />
      </ModalForm>
      {verTrazabilidad ? (
        <Trazabilidad handleFunction={handleCloseModal} obj={vrows} />
      ) : (
        ""
      )}
      {verarchivo ? (
        <ModalForm title={"Visualización"} handleClose={handleCloseModal}>
          <DialogContent dividers={true}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                {/* <h3>Nombre de archivo: {name}</h3> */}
              </Grid>
              <Grid item container justifyContent="center" xs={12}>
                <div className="ContainerVisualizacionSPEI">
                  <iframe width="100%" height="100%" src={URLruta} />
                </div>
              </Grid>
            </Grid>
          </DialogContent>
        </ModalForm>
      ) : (
        ""
      )}
    </div>
  );
};

export default VisorDocumentos;
