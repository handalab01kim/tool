import React, { useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import SqlPanel from './components/SqlPanel';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NotFound from './components/NotFound';
import Header from './components/Header';
import TablePage from "./components/TablePage";
import SingleTable from "./components/SingleTable";

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Segoe UI', sans-serif;
    background: #111;
    color: #eee;
    /* margin: 0; */
    padding: 2rem;
  }
`;

function App() {

    return (
    <>
    <GlobalStyle/>
		<div className='App'>
			<BrowserRouter>
				<Header />
				<Routes>
					<Route path="/" element={<TablePage />}></Route>
					<Route path="/history" element={<SingleTable api="histories"/>}></Route>
					{/* 상단에 위치하는 라우트들의 규칙을 모두 확인, 일치하는 라우트가 없는경우 처리 */}
					<Route path="*" element={<NotFound />}></Route>
				</Routes>
			</BrowserRouter>
		</div>
    </>
  );
}

export default App;
