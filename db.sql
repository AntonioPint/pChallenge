-- phpMyAdmin SQL Dump
-- version 4.9.7
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Tempo de geração: 28-Jan-2022 às 14:25
-- Versão do servidor: 5.7.36-cll-lve
-- versão do PHP: 7.3.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `lojacarl_pchallenge`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `Item`
--

CREATE TABLE `Item` (
  `ID` int(11) NOT NULL,
  `NAME` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `Item`
--

INSERT INTO `Item` (`ID`, `NAME`) VALUES
(1, 'Papel'),
(2, 'Caixa de Madeira'),
(3, 'Saco de Plástico'),
(9, 'table'),
(10, 'chair');

-- --------------------------------------------------------

--
-- Estrutura da tabela `Orders`
--

CREATE TABLE `Orders` (
  `ID` int(11) NOT NULL,
  `ITEM_ID` int(11) NOT NULL,
  `QUANTITY` int(11) NOT NULL,
  `USER_ID` int(11) NOT NULL,
  `CREATION_DATE` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `Orders`
--

INSERT INTO `Orders` (`ID`, `ITEM_ID`, `QUANTITY`, `USER_ID`, `CREATION_DATE`) VALUES
(1, 1, 3, 1, '2022-01-19'),
(2, 2, 1, 1, '2022-01-19');

-- --------------------------------------------------------

--
-- Estrutura da tabela `StockMovement`
--

CREATE TABLE `StockMovement` (
  `ID` int(11) NOT NULL,
  `CREATION_DATE` date NOT NULL,
  `ITEM_ID` int(11) NOT NULL,
  `QUANTITY` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `StockMovement`
--

INSERT INTO `StockMovement` (`ID`, `CREATION_DATE`, `ITEM_ID`, `QUANTITY`) VALUES
(1, '2022-01-19', 1, 1),
(2, '2022-01-19', 2, 3);

-- --------------------------------------------------------

--
-- Estrutura da tabela `Stock_Orders`
--

CREATE TABLE `Stock_Orders` (
  `ID` int(11) NOT NULL,
  `ORDER_ID` int(11) NOT NULL,
  `STOCK_ID` int(11) NOT NULL,
  `QUANTITY` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `Stock_Orders`
--

INSERT INTO `Stock_Orders` (`ID`, `ORDER_ID`, `STOCK_ID`, `QUANTITY`) VALUES
(1, 1, 1, 1),
(2, 2, 2, 1);
-- --------------------------------------------------------

--
-- Estrutura da tabela `User`
--

CREATE TABLE `User` (
  `ID` int(11) NOT NULL,
  `NAME` varchar(255) NOT NULL,
  `EMAIL` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `User`
--

INSERT INTO `User` (`ID`, `NAME`, `EMAIL`) VALUES
(1, 'António', 'antoniopintotrabalho@gmail.com'),
(2, 'Margarida', 'margarida@gmail.com'),
(27, 'ze', 'ze@mail.com');

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `Item`
--
ALTER TABLE `Item`
  ADD PRIMARY KEY (`ID`);

--
-- Índices para tabela `Orders`
--
ALTER TABLE `Orders`
  ADD PRIMARY KEY (`ID`);

--
-- Índices para tabela `StockMovement`
--
ALTER TABLE `StockMovement`
  ADD PRIMARY KEY (`ID`);

--
-- Índices para tabela `Stock_Orders`
--
ALTER TABLE `Stock_Orders`
  ADD PRIMARY KEY (`ID`);

--
-- Índices para tabela `User`
--
ALTER TABLE `User`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `Item`
--
ALTER TABLE `Item`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `Orders`
--
ALTER TABLE `Orders`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=183;

--
-- AUTO_INCREMENT de tabela `StockMovement`
--
ALTER TABLE `StockMovement`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT de tabela `Stock_Orders`
--
ALTER TABLE `Stock_Orders`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=181;

--
-- AUTO_INCREMENT de tabela `User`
--
ALTER TABLE `User`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
