# Lumine Login Page

Prompt para Lovable — Tela de Login (Lumine)

Contexto

Estou criando o front-end do Lumine, um sistema web de gestão de custos e rentabilidade para profissionais autônomas de estética (esteticistas, manicures, designers de sobrancelha etc). Nesta etapa quero apenas o layout da tela de Login, em React + Tailwind CSS. Não é necessário implementar lógica de autenticação, chamadas de API ou banco de dados — apenas o design da interface, com os campos e estados visuais prontos para eu conectar ao back-end depois (Java Spring Boot + PostgreSQL).

Identidade visual

Paleta de cores (usar exatamente estes hex):

Vinho Profundo (cor primária / texto de destaque): #6B1530

Berry Glow (cor de ação / botões): #C5325A

Rosa Aceso (hover, destaques secundários): #E8698A

Petal (acentos suaves, ícones, bordas): #F5A8BC

Luz Pálida (fundos suaves, cards): #FCE1E8

Cream (fundo geral da página): #FFF8F5

Ink (texto principal): #2E0F18

Tipografia:

Títulos / logo / headings: Fredoka (peso 600–700)

Textos, labels, inputs, botões: Manrope (peso 400–700)

Importar via Google Fonts: Fredoka e Manrope

Logo:

Wordmark "Lumine" em Fredoka bold, com o "i" em destaque na cor Berry Glow (#C5325A)

Um pequeno ícone de "faísca" (spark, formato de estrela de 4 pontas) ao lado ou sobre o "i", na cor Berry Glow ou Rosa Aceso

Usar o wordmark no topo da tela de login, centralizado

Estrutura da tela

Layout centralizado, estilo card, em um fundo --cream (#FFF8F5):

Logo/wordmark "Lumine" no topo, centralizado

Subtítulo curto abaixo do logo (ex: "Gestão de custos e rentabilidade para profissionais de estética")

Card de login centralizado na tela, fundo branco ou --pale (#FCE1E8), cantos bem arredondados (border-radius grande, ~20px), sombra suave

Dentro do card:

Campo de input email (name/id: email)

Campo de input senha (name/id: senha), tipo password, com ícone de olho para mostrar/ocultar senha

Link "Esqueci minha senha" alinhado à direita, abaixo do campo de senha, em cor Berry Glow

Botão principal "Entrar", largura total do card, fundo --berry (#C5325A), texto branco, hover para --wine (#6B1530)

Espaço reservado (rodapé do card) para eventual link de cadastro, algo como "Ainda não tem conta? Cadastre-se" — pode deixar como texto secundário

Nomenclatura dos campos (seguir à risca)

Estes nomes vêm diretamente da entidade Usuário do modelo de dados do back-end e devem ser usados exatamente assim nos inputs (atributo name/id), para facilitar a integração futura:

Campo do formulário name/id do input E-mail email Senha senha

Estados visuais a incluir

Estado padrão (vazio)

Estado com erro de validação (ex: "E-mail inválido" / "Senha obrigatória"), borda vermelha ou em --berry, texto de erro pequeno abaixo do campo

Estado de loading no botão "Entrar" (spinner ou texto "Entrando...")

Estado de foco nos inputs (borda em --rose ou --berry)

Tom visual geral

Interface leve, feminina sem ser infantil, acolhedora e profissional — pense em algo entre um app de bem-estar e uma ferramenta de gestão financeira. Bastante espaço em branco, cantos arredondados, sem elementos pesados ou corporativos demais. Sem ícones ou elementos de estoque genéricos — usar o ícone de "faísca" do Lumine como elemento decorativo sutil (ex: no fundo, com baixa opacidade, ou próximo ao logo).

Responsividade

A tela deve funcionar bem em desktop e tablet (RNF004 do projeto exige responsividade para esses dois formatos).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://lumine-spark-login.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a27a66bf-289a-4ad6-b991-f5367ea26ad9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
