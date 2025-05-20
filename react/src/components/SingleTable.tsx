import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { BASE_URL } from "../api/config";

interface RowData {
  [key: string]: any;
}
interface ApiResponse {
  rows: RowData[];
  total: number;
}
interface SignleTableProps{
  table:string;
  primary:string;
}
const limit = 20;

export default function SingleTable({table, primary}:SignleTableProps) {
  const [rows, setRows] = useState<RowData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
  // const headers = Object.keys(rows[0] || {});
  const [headers, setHeaders] = useState<string[]>([]);
  const [colWidths, setColWidths] = useState<number[]>([]);

  useEffect(() => {
    if (rows.length > 0) {
      const newHeaders = Object.keys(rows[0]);
      
      // headers가 비었을 때만 초기화 (1번만 실행됨)
      if (headers.length === 0) {
        setHeaders(newHeaders);
        setColWidths(newHeaders.map(() => 120));
      }
    }
  }, [rows]);


  const totalPages = Math.ceil(total / limit);
  const maxPagesShown = 10;
  const startPage = Math.floor((page - 1) / maxPagesShown) * maxPagesShown + 1;
  const endPage = Math.min(startPage + maxPagesShown - 1, totalPages);

  const fetchData = async (currentPage = page) => {
    try {
      const res = await axios.get<ApiResponse>(`${BASE_URL}/get-table`, {
        params: { page: currentPage, limit, table, primary },
      });
      setRows(res.data.rows);
      setTotal(res.data.total);
      setIsError(false);
    } catch (err) {
      // console.error("failed to load data:", err);
      setIsError(true);
    } finally{
      setIsLoading(false);
    }
  };

//   useEffect(() => {
//     const interval = setInterval(fetchData, 1000);
//     return () => clearInterval(interval);
//   }, [page]);
useEffect(() => {
  fetchData(page);
    const interval = setInterval(() => {
      fetchData(page);  // 페이지 변경에 관계없이 주기적으로 데이터 갱신
    }, 200);
  
    return () => clearInterval(interval);
  }, [page, table]);  // 빈 배열로 설정하여 컴포넌트 마운트 시 한 번만 실행

  // useEffect(() => {
  //   // 페이지 변경 시마다 데이터 갱신
  //   fetchData();
  // }, [page]);  // page가 바뀔 때마다 실행
  ///


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && page > 1) {
        setPage((p) => p - 1);
      } else if (e.key === "ArrowRight" && page < totalPages) {
        setPage((p) => p + 1);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [page, totalPages]);


  // resizer 핸들러 (표 크기 마우스 조정)
  const initResize = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = colWidths[idx];

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      setColWidths((prev) => {
        const next = [...prev];
        next[idx] = Math.max(60, startWidth + delta);  // 최소 60px
        return next;
      });
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };



  if (isLoading) return <Container>Loading...</Container>;
  if (isError) return <Container>Failed To Get Data</Container>;
  if (!isLoading && rows.length===0) return <Container>No Data</Container>;
  

  return (
    <Container>
      <Table>
        <colgroup>
        
          {/* {headers.map((_, idx) =>
            // idx === 2 ? (
            //   <col key={idx} style={{ width: "400px" }} />
            // ) : idx === 3 ? (
            //   <col key={idx} style={{ width: "60px" }} />
            // ) : 
            (
              <col key={idx} style={{ width: "30px" }} />
            )
          )} */}
          {headers.map((_, idx) => (
            <col key={idx} style={{ width: colWidths[idx] + "px" }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {headers.map((h, idx) => (
              <Th key={h}>
                {h}
                <Resizer
                  onMouseDown={(e) => initResize(e, idx)}
                />
              </Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {headers.map((h, i) => (
                <Td key={i}>
                  {row[h] === null
                    ? "null"
                    : typeof row[h] === "boolean"
                    ? row[h].toString()
                    : row[h]}
                </Td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination>
        {startPage > 1 && (
          <>
            <PageButton onClick={() => setPage(1)}>« First</PageButton>
            <PageButton onClick={() => setPage(startPage - 1)}>◀ Prev</PageButton>
          </>
        )}
        {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
          const pageNum = startPage + i;
          return (
            <PageButton
              key={pageNum}
              onClick={() => setPage(pageNum)}
              active={pageNum === page}
            >
              {pageNum}
            </PageButton>
          );
        })}
        {endPage < totalPages && (
          <>
            <PageButton onClick={() => setPage(endPage + 1)}>Next ▶</PageButton>
            <PageButton onClick={() => setPage(totalPages)}>Last »</PageButton>
          </>
        )}
      </Pagination>
    </Container>
  );
}


const Container = styled.div`
  font-family: monospace;
  background: #111;
  color: #eee;
  // padding: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  table-layout: fixed;
`;

const Th = styled.th`
  background: #222;
  border: 1px solid #444;
  padding: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 120px;
  position: sticky;
  top: 0;
  position: relative; /* Resizer 위치 기준 */
`;

const Td = styled.td`
  background: #1a1a1a;
  border: 1px solid #444;
  padding: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 120px;
`;

const Pagination = styled.div`
  margin-top: 1rem;
  text-align: center;
`;

const PageButton = styled.button<{ active?: boolean }>`
  background: ${({ active }) => (active ? "#0f0" : "#333")};
  color: ${({ active }) => (active ? "#111" : "#eee")};
  border: none;
  padding: 0.5rem 1rem;
  margin: 0 0.25rem;
  cursor: pointer;

  &:hover {
    background: #555;
  }
`;

const Resizer = styled.div`
  display: inline-block;
  width: 5px;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  cursor: col-resize;
  z-index: 1;
`;
