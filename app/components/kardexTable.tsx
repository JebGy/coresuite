import { KardexRow } from '@/types';
import React from 'react';

interface Props {
  data: KardexRow[];
}

export const KardexTable: React.FC<Props> = ({ data }) => (
  <table className="min-w-full border text-sm">
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Detalle</th>
        <th>Entradas</th>
        <th>Salidas</th>
        <th>Saldo (Unidades)</th>
        <th>Saldo (Valor)</th>
        <th>Costo Promedio</th>
      </tr>
    </thead>
    <tbody>
      {data.map((row, i) => (
        <tr key={i}>
          <td>{row.fecha}</td>
          <td>{row.detalle}</td>
          <td>{row.entrada}</td>
          <td>{row.salida}</td>
          <td>{row.saldoCantidad}</td>
          <td>{row.saldoValor.toFixed(2)}</td>
          <td>{row.costoPromedio.toFixed(2)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);