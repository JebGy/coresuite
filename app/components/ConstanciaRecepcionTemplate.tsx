import React from "react";
import { Movimiento, Producto, Proveedor } from "@/types";

interface ConstanciaRecepcionTemplateProps {
  movimiento: Movimiento & { producto: Producto };
  proveedor?: Proveedor;
  numeroGuia?: string;
  agenciaTransporte?: string;
  numeroGuiaAgencia?: string;
  observaciones?: string;
}

export const ConstanciaRecepcionTemplate: React.FC<
  ConstanciaRecepcionTemplateProps
> = ({
  movimiento,
  proveedor,
  numeroGuia,
  agenciaTransporte,
  numeroGuiaAgencia,
  observaciones,
}) => {
  const fecha = new Date(movimiento.fecha);
  const fechaFormateada = fecha.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const horaFormateada = fecha.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const emptyRows = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        lineHeight: "1.2",
        color: "#000",
        background: "white",
        margin: "20px auto",
      }}
    >
      <style type="text/css" media="print">
        {
          "\
  @page { size: landscape; }\
"
        }
      </style>
      <div
        style={{
          border: "2px solid #000",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px",
            borderBottom: "2px solid #000",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "60px",
              marginRight: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img src="/rg.png" alt="" />
          </div>
          <div
            style={{
              flex: 1,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              FORMATO DE REGISTRO DE RECEPCION DE MATERIALES
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                background: "#4472C4",
                color: "white",
                padding: "5px",
                margin: "5px 0",
              }}
            >
              REGISTRO DE RECEPCION
            </div>
          </div>
          <div
            style={{
              textAlign: "right",
              fontSize: "10px",
              lineHeight: "1.3",
            }}
          >
            <div>Código: {movimiento.constancia?.movimientoId || 'N/A'}</div>
            <div>Versión: 01</div>
            <div>Fecha: {fechaFormateada}</div>
          </div>
        </div>

        {/* Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                  fontSize: "11px",
                  background: "#4472C4",
                  color: "white",
                  fontWeight: "bold",
                  width: "5%",
                }}
              >
                N°
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                  fontSize: "11px",
                  background: "#4472C4",
                  color: "white",
                  fontWeight: "bold",
                  width: "10%",
                }}
              >
                FECHA
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                  fontSize: "11px",
                  background: "#4472C4",
                  color: "white",
                  fontWeight: "bold",
                  width: "10%",
                }}
              >
                HORA ENTRADA
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                  fontSize: "11px",
                  background: "#4472C4",
                  color: "white",
                  fontWeight: "bold",
                  width: "25%",
                }}
              >
                DESCRIPCION DEL PRODUCTO
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                  fontSize: "11px",
                  background: "#4472C4",
                  color: "white",
                  fontWeight: "bold",
                  width: "15%",
                }}
              >
                PROVEEDOR
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                  fontSize: "11px",
                  background: "#4472C4",
                  color: "white",
                  fontWeight: "bold",
                  width: "10%",
                }}
              >
                NRO GUIA
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                  fontSize: "11px",
                  background: "#4472C4",
                  color: "white",
                  fontWeight: "bold",
                  width: "10%",
                }}
              >
                AGENCIA DE TRANSP.
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                  fontSize: "11px",
                  background: "#4472C4",
                  color: "white",
                  fontWeight: "bold",
                  width: "10%",
                }}
              >
                NRO GUIA DE AGENC TRANSP.
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                  fontSize: "11px",
                  background: "#4472C4",
                  color: "white",
                  fontWeight: "bold",
                  width: "15%",
                }}
              >
                OBSERVAC.
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ height: "40px" }}>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "left",
                  fontSize: "11px",
                  fontWeight: "bold",
                  background: "#f8f9fa",
                }}
              >
                1
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "left",
                  fontSize: "11px",
                  fontWeight: "bold",
                  background: "#f8f9fa",
                }}
              >
                {fechaFormateada}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "left",
                  fontSize: "11px",
                  fontWeight: "bold",
                  background: "#f8f9fa",
                }}
              >
                {horaFormateada}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "left",
                  fontSize: "11px",
                  fontWeight: "bold",
                  background: "#f8f9fa",
                }}
              >
                {movimiento.producto.nombre} -{" "}
                {movimiento.producto.descripcion || ""}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "left",
                  fontSize: "11px",
                  fontWeight: "bold",
                  background: "#f8f9fa",
                }}
              >
                {proveedor?.nombre || "N/A"}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "left",
                  fontSize: "11px",
                  fontWeight: "bold",
                  background: "#f8f9fa",
                }}
              >
                {numeroGuia || movimiento.factura || "N/A"}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "left",
                  fontSize: "11px",
                  fontWeight: "bold",
                  background: "#f8f9fa",
                }}
              >
                {agenciaTransporte || "N/A"}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "left",
                  fontSize: "11px",
                  fontWeight: "bold",
                  background: "#f8f9fa",
                }}
              >
                {numeroGuiaAgencia || "N/A"}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "left",
                  fontSize: "11px",
                  fontWeight: "bold",
                  background: "#f8f9fa",
                }}
              >
                {observaciones || movimiento.motivo}
              </td>
            </tr>
            {emptyRows.map((_, index) => (
              <tr key={index} style={{ height: "40px" }}>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "center",
                    fontSize: "11px",
                  }}
                ></td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "center",
                    fontSize: "11px",
                  }}
                ></td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "center",
                    fontSize: "11px",
                  }}
                ></td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "center",
                    fontSize: "11px",
                  }}
                ></td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "center",
                    fontSize: "11px",
                  }}
                ></td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "center",
                    fontSize: "11px",
                  }}
                ></td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "center",
                    fontSize: "11px",
                  }}
                ></td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "center",
                    fontSize: "11px",
                  }}
                ></td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "center",
                    fontSize: "11px",
                  }}
                ></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
