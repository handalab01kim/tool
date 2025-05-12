import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { BASE_URL } from "../api/config";
import { useConfigStore } from '../store/configStore'; 
type Data = Record<string, Array<Record<string, any>> | { error: string }>;

export default function DataPanel() {
  const [data, setData] = useState<Data | null>(null);
  const [editingCell, setEditingCell] = useState<{ table: string; rowIdx: number; key: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [selectMode, setSelectMode] = useState<Record<string, boolean>>({});
  const [selectedRows, setSelectedRows] = useState<Record<string, Set<any>>>({});
  
  const { isSqlPanelVisible, isConfigVisible } = useConfigStore(); // for shortcut


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
    const intervalId = setInterval(fetchData, 200);
    return () => clearInterval(intervalId);
  }, []);

  const handleCellClick = (table: string, rowIdx: number, key: string, value: any) => {
    setEditingCell({ table, rowIdx, key });
    setEditValue(value);
  };

  const handleCellBlur = async () => {
    if (!data || !editingCell) return;
    const { table, rowIdx, key } = editingCell;
    const row = (data[table] as any[])[rowIdx];
    const primaryKey = Object.keys(row)[0]; // 첫 번째 컬럼을 기본키로 가정

    if (row[key] === editValue) {
      setEditingCell(null);
      return;
    }

    try {
      await axios.put(`${BASE_URL}/row`, {
        table,
        // primary: primaryKey,
        old: {...row},
        row: {
          ...row,
          [key]: editValue
        }
      });
      setEditingCell(null);
      fetchData();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const toggleRowSelection = (table: string, id: any) => {
    setSelectedRows((prev) => {
      const set = new Set(prev[table] || []);
      set.has(id) ? set.delete(id) : set.add(id);
      return { ...prev, [table]: set };
    });
  };

  const toggleSelectMode = (table: string) => {
    setSelectMode((prev) => ({ ...prev, [table]: !prev[table] }));
    setSelectedRows((prev) => ({ ...prev, [table]: new Set() }));
  };

  const handleDeleteSelected = async (table: string) => {
    const confirmDelete = window.confirm("정말로 선택한 행을 삭제하시겠습니까?");
    if (!confirmDelete || !data) return;

    const rowData = data[table];
    if (!Array.isArray(rowData) || rowData.length === 0) return;
    const primaryKey = Object.keys(rowData[0])[0]; // warn !
    const ids = Array.from(selectedRows[table] || []);
    if (ids.length === 0) return;

    try {
      await axios.delete(`${BASE_URL}/row`, {
        data: {
          table,
          primary: primaryKey,
          values: ids,
        },
      });
      fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setSelectMode((prev) => ({ ...prev, [table]: false }));
      setSelectedRows((prev) => ({ ...prev, [table]: new Set() }));
    }
  };


  // ESC shortcut
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSqlPanelVisible && !isConfigVisible) {
        // ESC 키로 편집 모드 취소
        // if(editingCell!=null){
        setEditingCell(null);      // 편집 상태 해제
        setEditValue("");          // 입력값 초기화
          
          // }
          
        // ESC 키로 삭제 모드 취소
        // const isAnyDeleteMode = Object.values(selectMode).some((v) => v === true);
        // console.log(isAnyDeleteMode, "!!!!!!!!!!!!!!!!");
        // if (isAnyDeleteMode) {
        setSelectMode({});
        setSelectedRows({});
          // return;
        // }
        return;
      }
    };
  
    document.addEventListener("keydown", handleEscKey);
  
    return () => {
      document.removeEventListener("keydown", handleEscKey);  // cleanup
    };
  }, [isSqlPanelVisible, isConfigVisible]);  // isSqlPanelVisible 상태가 바뀔 때마다 리스너가 반영됨
  



  if (!data) return <Wrapper>Loading...</Wrapper>;

  return (
    <Wrapper>
      {Object.entries(data).map(([table, rows]) => (
        <TableBlock key={table}>
          <TableHeader>
            <TableTitle>{table}</TableTitle>
            <ActionArea>
              {selectMode[table] ? (
                  <>
                    <DeleteBtn onClick={() => handleDeleteSelected(table)}>Run</DeleteBtn>
                    <CancelBtn onClick={() => toggleSelectMode(table)}>❌</CancelBtn>
                  </>
              ) : (
                  <DeleteBtn onClick={() => {
                    toggleSelectMode(table);
                    // setEditingCell(null);
                    // setEditValue("");
                  }}>🗑</DeleteBtn>
              )}
            </ActionArea>
          </TableHeader>


          {Array.isArray(rows) && rows.length > 0 ? (
            <StyledTable>
              <thead>
                <tr>
                  {selectMode[table] && <Th></Th>}
                  {Object.keys(rows[0]).map((key) => (
                    <Th key={key}>{key}</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => {
                  const primaryKey = Object.keys(row)[0];
                  const primaryVal = row[primaryKey];

                  return (
                    <tr key={rowIdx}>
                      {selectMode[table] && (
                        <Td>
                          <input
                            type="checkbox"
                            checked={selectedRows[table]?.has(primaryVal) || false}
                            onChange={() => toggleRowSelection(table, primaryVal)}
                          />
                        </Td>
                      )}
                      {Object.entries(row).map(([key, value]) => (
                        <Td
                          key={key}
                          onClick={() => handleCellClick(table, rowIdx, key, value)}
                        >
                          {editingCell &&
                          editingCell.table === table &&
                          editingCell.rowIdx === rowIdx &&
                          editingCell.key === key ? (
                            <input
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellBlur}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleCellBlur();
                              }}
                            />
                          ) : (
                            value?.toString() || "null"
                          )}
                        </Td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </StyledTable>
          ) : (
            <p>No data</p>
          )}
        </TableBlock>
      ))}
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
  align-items: center;
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
  cursor: pointer;
`;

const DeleteBtn = styled.button`
  background: crimson;
  color: white;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background: darkred;
  }
`;

const ActionArea = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const CancelBtn = styled.button`
  background: #555;
  color: white;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background: #777;
  }
`;