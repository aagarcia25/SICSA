import { Gantt, Task } from "gantt-task-react";
import React, { useEffect, useLayoutEffect, useState } from "react";
import ModalForm from "./ModalForm";
import "gantt-task-react/dist/index.css";
import { AuditoriaService } from "../../services/AuditoriaService";
import Progress from "../Progress";
import { Box, Grid, Typography } from "@mui/material";
import ButtonsAdd from "./ButtonsAdd";
import { PlanTrabajoModal } from "../Auditoria/PlanTrabajo/PlanTrabajoModal";
import { getUser } from "../../services/localStorage";
import { USUARIORESPONSE } from "../../interfaces/UserInfo";

export const GanttModal = ({
  handleFunction,
  obj,
}: {
  handleFunction: Function;
  obj: any;
}) => {
  const [openSlider, setOpenSlider] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tipoOperacion, setTipoOperacion] = useState(0);
  const [modo, setModo] = useState("");
  const [open, setOpen] = useState(false);
  const [vrows, setVrows] = useState({});
  const [agregar, setAgregar] = useState<boolean>(true);
  const user: USUARIORESPONSE = JSON.parse(String(getUser()));


  const consulta = () => {
    let data = {
      NUMOPERACION: 4,
      P_IDAUDITORIA: obj.id,
    };



    let ta: Task[] = [];
    AuditoriaService.planindex(data).then((res) => {
      if (res.SUCCESS) {
        res.RESPONSE.map((item: any) => {
          let tes = {
            start: new Date(item.start),
            end: new Date(item.end),
            name: item.name,
            id: item.id,
            type: item.type,
            progress: 0,
            isDisabled: false,
            styles: {
              progressColor: "#ffbb54",
              progressSelectedColor: "#ff9e0d",
            },
            fontSize: "9",
          };
          ta.push(tes);
        });
        console.log(ta[0]);
        setTasks(ta);
        setOpenSlider(false);
      }
    });
  };

  const handleOpen = (v: any) => {
    setTipoOperacion(1);
    setModo("Agregar Registro");
    setOpen(true);
    setVrows("");
  };

  const handleOpenEdit = (v: any) => { console.log("v",v);
  
    setTipoOperacion(2);
    setModo("Editar Registro");
    setOpen(true);
    setVrows(v);
  };

  const handleClose = () => {
    setOpen(false);
    //setOpenAdjuntos(false);
    consulta();
  };

  useEffect(() => {
    console.log(obj);
    consulta();
  }, []);

  return (
    <div>
      <ModalForm title={"PLAN DE TRABAJO"} handleClose={handleFunction}>
      {open ? (
          <PlanTrabajoModal
            tipo={tipoOperacion}
            handleClose={handleClose}
            datos={vrows}
            idauditoria={obj.id}
            obj={vrows}
            

          />
        ) : (
          ""
        )}
      <ButtonsAdd handleOpen={handleOpen} agregar={agregar} />
        <Grid item xs={10} sm={10} md={10} lg={10}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              paddingBottom: "10px",
            }}
          >
            <Typography variant="h6">
              {obj.row.NAUDITORIA + " " + obj.row.NombreAudoria}
            </Typography>
          </Box>
        </Grid>
        {tasks.length > 0 ? (
          <Gantt
            tasks={tasks}
            locale={"es"}
            ganttHeight={400}
            columnWidth={60}
            onDoubleClick={handleOpenEdit}
            fontSize={"9"}
            listCellWidth={"155px"}
          />
        ) : (
          <Progress open={openSlider}></Progress>
        )}
      </ModalForm>
    </div>
  );
};

export default GanttModal;
