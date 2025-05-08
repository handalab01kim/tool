import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useConfigStore } from '../store/configStore';
import axios from 'axios';
import { BASE_URL } from '../api/config';

export default function ConfigPanel() {
  const { dbConfig, tablesToWatch, setDbConfig, setTablesToWatch } = useConfigStore();
//   const [form, setForm] = useState(dbConfig); // 장상 작동 안함
  const [form, setForm] = useState({
    host: '',
    port: 5432,
    user: '',
    password: '',
    database: '',
  });
  const [tableList, setTableList] = useState(tablesToWatch.join(', '));
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`${BASE_URL}/config`)
      .then(res => {
        const { dbConfig, tablesToWatch } = res.data;
        const safeDbConfig = dbConfig || {};
        const safeTables = Array.isArray(tablesToWatch) ? tablesToWatch : [];

        setForm(safeDbConfig);
        setTableList(safeTables.join(', '));
        setDbConfig(safeDbConfig);
        setTablesToWatch(safeTables);
      })
      .catch(err => console.error('초기 설정값 불러오기 실패:', err));
  }, []); // isOpen이 true일 때마다 실행됨
  

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const tables = tableList.split(',').map((t) => t.trim()).filter(Boolean);
      const sendData = {
        dbConfig: {
          ...form,
          port: Number(form.port),
        },
        tablesToWatch: tables
      };
      console.log(sendData);
      await axios.post(`${BASE_URL}/update-config`, sendData);
      setDbConfig(form);
      setTablesToWatch(tables);
      setMessage('설정이 성공적으로 반영되었습니다.');
    } catch (err) {
      console.error(err);
      setMessage('설정 적용 실패.');
    } finally{
      setTimeout(()=>{setMessage('')}, 3000);
    }
  };

  return (
    <Panel>
      <h2>DB 연결 설정</h2>
      <Label>Host</Label><Input name="host" value={form.host} onChange={handleChange}/>
      <Label>Port</Label><Input name="port" type="number" value={form.port}  onChange={handleChange}/>
      <Label>User</Label><Input name="user" value={form.user} onChange={handleChange}/>
      <Label>Password</Label><Input name="password" type="password" value={form.password}  onChange={handleChange}/>
      <Label>Database</Label><Input name="database" value={form.database} onChange={handleChange}/>

      <Label>Tables to Watch (comma-separated)</Label>
      <Input value={tableList} onChange={(e) => setTableList(e.target.value)} />

      <Button onClick={handleSubmit}>설정 저장</Button>
      {message && <p>{message}</p>}
    </Panel>
  );
}

const Panel = styled.div`
  padding: 1rem;
  background: #222;
  color: white;
  border: 1px solid #444;
  border-radius: 8px;
  max-width: 600px;
  margin: 2rem auto;
`;

const Label = styled.label`
  display: block;
  margin-top: 0.75rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  background: #333;
  color: white;
  border: none;
  border-radius: 4px;
`;

const Button = styled.button`
  margin-top: 1rem;
  background: #00a1e0;
  border: none;
  padding: 0.5rem 1rem;
  color: white;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
`;