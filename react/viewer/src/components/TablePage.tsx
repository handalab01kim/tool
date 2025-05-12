import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { BASE_URL } from "../api/config";

type Data = Record<string, Array<Record<string, any>> | { error: string }>;

type ColumnOpMode = "add" | "rename" | "delete";

export default function DataPanel() {
  const [data, setData] = useState<Data | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState<ColumnOpMode>("add");
  const [tableName, setTableName] = useState("");
  const [columnName, setColumnName] = useState("");
  const [newColumnName, setNewColumnName] = useState("");
  const [columnType, setColumnType] = useState("TEXT");

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/data`);
      setData(res.data);
    } catch (err) {
      console.error("failed to load data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 2000); // reduce interval
    return () => clearInterval(intervalId);
  }, []);

  const openModal = (table: string, mode: ColumnOpMode) => {
    setTableName(table);
    setMode(mode);
    setColumnName("");
    setNewColumnName("");
    setColumnType("TEXT");
    setModalVisible(true);
  };

  const applyColumnChange = async () => {
    try {
      await axios.post(`${BASE_URL}/alter-table`, {
        type: mode,
        tableName,
        columnName,
        newColumnName,
        columnType,
      });
      setModalVisible(false);
      fetchData();
    } catch (err) {
      console.error("Failed to alter column:", err);
    }
  };

  if (!data) return <Wrapper>Loading...</Wrapper>;

  return (
    <Wrapper>
      {Object.entries(data).map(([table, rows]) => (
        <TableBlock key={table}>
          <TableHeader>
            <TableTitle>{table.split("/")[0]}</TableTitle>
            <ActionGroup>
              <ActionButton onClick={() => openModal(table, "add")}>+ Add</ActionButton>
              <ActionButton onClick={() => openModal(table, "rename")}>✏ Rename</ActionButton>
              <ActionButton onClick={() => openModal(table, "delete")}>🗑 Delete</ActionButton>
            </ActionGroup>
          </TableHeader>
          {Array.isArray(rows) && rows.length > 0 ? (
            <StyledTable>
              <thead>
                <tr>
                  {Object.keys(rows[0]).map((header) => (
                    <Th key={header}>{header}</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((cell, i) => (
                      <Td key={i}>
                        {cell === null || cell === undefined
                          ? "null"
                          : typeof cell === "boolean"
                          ? cell.toString()
                          : cell}
                      </Td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          ) : "error" in rows ? (
            <ErrorMsg>Error: {rows.error}</ErrorMsg>
          ) : (
            <p>No data</p>
          )}
        </TableBlock>
      ))}

      {modalVisible && (
        <Modal>
          <h3>{mode === "add" ? "Add Column" : mode === "rename" ? "Rename Column" : "Delete Column"}</h3>
          <Label>Table: {tableName}</Label>
          <Label>Column Name</Label>
          <Input value={columnName} onChange={(e) => setColumnName(e.target.value)} />
          {mode === "rename" && (
            <>
              <Label>New Column Name</Label>
              <Input value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)} />
            </>
          )}
          {mode === "add" && (
            <>
              <Label>Column Type</Label>
              <Input value={columnType} onChange={(e) => setColumnType(e.target.value)} />
            </>
          )}
          <div style={{ marginTop: "1rem" }}>
            <ActionButton onClick={applyColumnChange}>Apply</ActionButton>
            <ActionButton onClick={() => setModalVisible(false)}>Cancel</ActionButton>
          </div>
        </Modal>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
`;

const TableBlock = styled.div`
  background: #1c1c1c;
  padding: 1rem;
  border-radius: 8px;
  min-width: 300px;
  max-width: 100%;
  overflow-x: auto;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TableTitle = styled.h2`
  margin-top: 0;
  font-size: 1.2rem;
  color: #0f0;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: #333;
  border: 1px solid #333;
  padding: 0.5rem;
  text-align: left;
  white-space: nowrap;
`;

const Td = styled.td`
  background: #222;
  border: 1px solid #333;
  padding: 0.5rem;
  white-space: nowrap;
`;

const ErrorMsg = styled.p`
  color: red;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: #444;
  border: none;
  color: white;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background: #666;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 30%;
  left: 40%;
  background: #222;
  border: 1px solid #555;
  padding: 1rem;
  z-index: 999;
  color: white;
  border-radius: 8px;
`;

const Input = styled.input`
  width: 100%;
  margin: 0.3rem 0 0.6rem;
  padding: 0.3rem;
  border-radius: 4px;
  border: 1px solid #444;
  background: #111;
  color: white;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #ccc;
`;

