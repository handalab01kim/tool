import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface InsertModalProps {
  table: string;
  fields: string[];
  defaultRows: Record<string, any>[];
  onClose: () => void;
  onSubmit: (rows: Record<string, any>[]) => void;
}

export default function InsertModal({ table, fields, defaultRows, onClose, onSubmit }: InsertModalProps) {
  const [rows, setRows] = useState<Record<string, any>[]>(defaultRows);
  // const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (rIdx: number, key: string, value: string) => {
    setRows(prev => {
      const updated = [...prev];
      updated[rIdx][key] = value;
      return updated;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const modal = document.getElementById('insert-modal');
    if (modal) {
      const dx = e.clientX - dragOffset.x;
      const dy = e.clientY - dragOffset.y;
      modal.style.transform = `translate(${dx}px, ${dy}px)`;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  });

  return (
    <Overlay>
      <ModalBox id="insert-modal">
        <Header onMouseDown={handleMouseDown}>
          <strong>{table} - Insert</strong>
          <CloseBtn onClick={onClose}>X</CloseBtn>
        </Header>
        <Content>
          {rows.map((row, rIdx) => (
            <RowBlock key={rIdx}>
              {fields.map((key) => (
                <Field key={key}>
                  <label>{key}</label>
                  <input
                    type="text"
                    value={row[key] ?? ""}
                    onChange={(e) => handleChange(rIdx, key, e.target.value)}
                  />
                </Field>
              ))}
            </RowBlock>
          ))}
        </Content>
        <SubmitBtn onClick={() => onSubmit(rows)}>Submit</SubmitBtn>
      </ModalBox>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const ModalBox = styled.div`
  background: #111;
  color: white;
  padding: 1rem;
  border-radius: 10px;
  min-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: absolute;
  top: 20%;
  left: 30%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  cursor: move;
  background: #222;
  padding: 0.5rem;
`;

const CloseBtn = styled.button`
  background: crimson;
  color: white;
  border: none;
  padding: 0 0.5rem;
  cursor: pointer;
`;

const Content = styled.div`
  max-height: 50vh;
  overflow-y: auto;
`;

const RowBlock = styled.div`
  border-bottom: 1px solid #444;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;

  input {
    background: #222;
    color: white;
    padding: 0.25rem;
    border: 1px solid #444;
  }
`;

const SubmitBtn = styled.button`
  background: seagreen;
  color: white;
  font-weight: bold;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;

  &:hover {
    background: mediumseagreen;
  }
`;
