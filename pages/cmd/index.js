import React, { useState } from "react";
import CMDInput from "../../components/CMDInput/CMDInput";
import Overlay from "../../components/Overlay/Overlay";
import style from "./cmd.module.css";
import { useRouter } from "next/router";
import prisma from "../../lib/prisma";
import Head from "next/head";

const CMD = ({ commands }) => {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  const handleInput = (userCommand) => {
    if (userCommand === "help") {
      return setShowHelp(true);
    }

    if (userCommand === "restart") {
      return window.location.reload();
    }

    const selectedCommand = commands.find(({ command }) => command === userCommand);

    if (selectedCommand && selectedCommand.unlocked) return router.push(selectedCommand.route);
  };

  return (
    <Overlay>
      <Head>
        <title>{router.pathname}</title>
      </Head>
      <div className={style.content}>
        <div className={style["content-body"]}>
          <p>H.O.M.S.A. asistente personal [Versión 10.0.19043.1826]</p>
          <p>(c) H.O.M.S.A. Corporation. Todos los derechos reservados.</p>
          {showHelp && (
            <div>
              <p>Use one of the following commands:</p>
              <ul>
                <li>{"help : Muestra un listado de comandos disponibles"}</li>
                <li>{"restart : Reinicia la aplicación"}</li>
                {commands.map(({ id, command, description }) => (
                  <li key={id}>{`${command} : ${description}`}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <CMDInput callback={handleInput} />
      </div>
    </Overlay>
  );
};

export const getStaticProps = async () => {
  const commands = await prisma.commands.findMany({});

  return {
    props: { commands: JSON.parse(JSON.stringify(commands)) },
    revalidate: 10,
  };
};

export default CMD;
