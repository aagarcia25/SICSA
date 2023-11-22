import { Button, FormControl, FormControlLabel, FormLabel, Grid, MenuItem, Radio, RadioGroup, Tooltip, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import MUIXDataGrid from "../MUIXDataGrid";
import { AuditoriaService } from "../../services/AuditoriaService";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getUser } from "../../services/localStorage";
import { USUARIORESPONSE } from "../../interfaces/UserInfo";
import ArticleIcon from '@mui/icons-material/Article';
import SelectFrag from "../componentes/SelectFrag";
import SelectValues from "../../interfaces/Share";
import { ShareService } from "../../services/ShareService";
import { ReporteService } from "./ReporteService";
import { log } from "console";
import { Toast } from "../../helpers/Toast";
import React from "react";
import { IReportes } from "../../interfaces/menu";
import { getHeaderInfoReporte } from "../../services/tokenCreator";
import axios from "axios";

export const Reportes = () => {

  const [data, setData] = useState([]);
  const [idOrigenAuditoria, setidOrigenAuditoria] = useState("");
  const [ListOrigenAuditoria, setListOrigenAuditoria] = useState<SelectValues[]>([]);
  const [anio, setanio] = useState("");
  const [ListAnio, setListAnio] = useState<SelectValues[]>([]);
  const [REPORTE, setREPORTE] = useState("");
  const [TIPO, setTIPO] = useState("");
  const [idEntidadFis, setidEntidadFis] = useState("");
  const [ListEntidadFis, setListEntidadFis] = useState<SelectValues[]>([]);
  const [selectedValue, setSelectedValue] = React.useState('PDF');
  const [Reporte, setReporte] = useState<IReportes>();
  const [listaReportes, setListaReportes] = useState<IReportes[]>([]);


  const downloadPdfFromBase64 = (base64String: string, fileName: string) => {
    const byteCharacters = atob(base64String); // Decodificar el string base64
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    // Crear un enlace <a> para descargar el archivo
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;

    // Simular un clic en el enlace para descargar el archivo
    link.click();

    // Limpiar después de la descarga
    window.URL.revokeObjectURL(link.href);
  };


  const user: USUARIORESPONSE = JSON.parse(String(getUser()));


  const handleGenerar = () => {

    //setOpenSlider(true);
    let flag = true;
    if (TIPO === "") {
      Toast.fire({
        title: "Es obligatorio el tipo de reporte",
        icon: "warning",
      });
      flag = false;
      //setOpenSlider(false);
    }

    if (flag) {
      const params = {
        TIPO: TIPO,
        P_ANIO: anio,
        REPORTE: "REP_01.jrxml"
      };

      let data = {
        CHID: Reporte?.id,
        TIPO: TIPO,
        PARAMETROS: params,
        P_ANIO: anio,
        REPORTE: "REP_01.jrxml"
      };

      try {
        let header = getHeaderInfoReporte();
        axios
          .post(
            process.env.REACT_APP_APPLICATION_BASE_URL_REPORTES + "ReportesIndex",
            params,
            // { responseType: "blob" }
          )
          .then((response) => {



            const archivo = response?.data?.RESPONSE;




            // Llamar a la función para descargar el archivo PDF
            downloadPdfFromBase64(archivo, "REP_01" + "." + TIPO);

          }
          )
          .catch((error) => {
            //setOpenSlider(false);
            console.log(error);
            Toast.fire({
              title: "Error en la Generación de Reporte",
              icon: "warning",
            });
          });
      } catch (err: any) {
        //setOpenSlider(false);
        console.log(err);
      }
    }
  };



  const handleFilterChangeinicio = (v: string) => {
    setidOrigenAuditoria(v);
  };

  const handleFilterAnio = (v: string) => {
    setanio(v);
  };

  const handleFilterEntidadFis = (v: string) => {
    setidEntidadFis(v);
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    setTIPO(event.target.value);

  };
  const handleReporte = (data: IReportes) => {
    setReporte(data);
  };

  const loadFilter = (operacion: number, id?: string) => {
    let data = { NUMOPERACION: operacion, P_ID: id };
    ShareService.SelectIndex(data).then((res) => {
      if (operacion === 5) {
        //  setCatInforme(res.RESPONSE);
      } else if (operacion === 1) {
        setListAnio(res.RESPONSE);
      }
      else if (operacion === 14) {
        setListOrigenAuditoria(res.RESPONSE);
      }
      else if (operacion === 2) {
        setListEntidadFis(res.RESPONSE);
      }
      //else if (operacion === 16) {
      //     setListInicio(res.RESPONSE);
      //   } else if (operacion === 18) {
      //     setListIdEstatus(res.RESPONSE);
      //   } else if (operacion === 17) {
      //     setListMunicipio(res.RESPONSE);
      //   }
    });
  };


  useEffect(() => {
    loadFilter(1);
    loadFilter(14);
    loadFilter(2);

    //consulta();
  }, []

  )

  return (
    <Grid container spacing={1} padding={0}>
      <Grid
        container
        item
        spacing={1}
        xs={12}
        sm={12}
        md={12}
        lg={12}
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{ padding: "1%" }}
      >
        <h1>Reportes</h1>
      </Grid>

      <Grid
        container
        item
        spacing={1}
        xs={12}
        sm={12}
        md={12}
        lg={12}
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{ padding: "1%" }}
      >

        <FormControl component="fieldset">
          <FormLabel component="legend" sx={{ textAlign: "center" }}>Tipo de Reporte</FormLabel>

          {/* <Grid paddingTop={1} container item xs={12} md={6} justifyContent="center"> */}
          <RadioGroup
            aria-label="options"
            name="options"
            value={TIPO}
            onChange={handleChange}
            sx={{ display: "flex", flexDirection: "row" }}
          >
            {/* <Grid container item xs={12} md={4} lg={8} sx={{ textAlign: "center" }}> */}
            <Grid item xs={12} sm={6} md={4} lg={4}>

              <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <FormControlLabel value="XLSX" control={<Radio />} label="XLSX" />
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={4}>
              <FormControlLabel value="xls" control={<Radio />} label="XLS" />
            </Grid>
            {/* </Grid> */}


          </RadioGroup>
          {/* </Grid> */}
        </FormControl>
      </Grid>

      <Grid
        container
        item
        spacing={1}
        xs={12}
        sm={12}
        md={12}
        lg={12}
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{ padding: "1%" }}
      >

        {/* <Grid container item xs={12} md={8} lg={8} sx={{ textAlign: "center" }}> */}

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Typography sx={{ fontFamily: "sans-serif" }}>
            Clasificación Auditoría:
          </Typography>
          <SelectFrag
            value={idOrigenAuditoria}
            options={ListOrigenAuditoria}
            onInputChange={handleFilterChangeinicio}
            placeholder={"Seleccione.."}
            disabled={false}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Typography sx={{ fontFamily: "sans-serif" }}>
            Año Cuenta Pública:
          </Typography>
          <SelectFrag
            value={anio}
            options={ListAnio}
            onInputChange={handleFilterAnio}
            placeholder={"Seleccione.."}
            disabled={false}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Typography sx={{ fontFamily: "sans-serif" }}>
            Entidad Fiscalizada:
          </Typography>
          <SelectFrag
            value={idEntidadFis}
            options={ListEntidadFis}
            onInputChange={handleFilterEntidadFis}
            placeholder={"Seleccione.."}
            disabled={false}
          />
        </Grid>
        {/* </Grid> */}
      </Grid>
      <Grid
        container
        item
        spacing={1}
        xs={12}
        sm={12}
        md={12}
        lg={12}
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{ padding: "1%" }}
      >
        <Button
          className={"actualizar"}
          onClick={() => handleGenerar()}
        >
          {"Generar Reporte"}
        </Button>
        {/* <Button
              className={"actualizar"}
              onClick={() => handleReporte()}
            >
              {"Generar noose"}
            </Button> */}

        {/* {listaReportes.map((item, index) => (
              <Tooltip title={item.Descripcion}>
                <MenuItem
                  className="menu-Typography-report"
                  onClick={() => handleReporte(item)}
                >
                  {item.Nombre}
                </MenuItem>
              </Tooltip>
            ))} */}
      </Grid>



    </Grid>
  );
}