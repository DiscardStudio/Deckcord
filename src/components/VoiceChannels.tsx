import { call } from "@decky/api";
import { DialogButton, Dropdown, DropdownOption } from "@decky/ui";
import { useEffect, useState } from "react";

function urlContentToDataUri(url: string) {
  return fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((callback) => {
          let reader = new FileReader();
          reader.onload = function () {
            callback(this.result);
          };
          reader.readAsDataURL(blob);
        })
    );
}

export function VoiceChannels() {
  const [selectedChannel, setChannel] = useState<any>();
  const [channels, setChannels] = useState<DropdownOption[]>([]);
  const [selectedGuild, setGuild] = useState<any>();
  const [guilds, setGuilds] = useState<DropdownOption[]>([]);

  useEffect(() => {
    call<[], Record<string, any>>("get_guilds")
      .then(res => {
        if (!res || "error" in res)
          return;
        const nextGuilds: DropdownOption[] = Object.entries(res).map(([channelId, label]) => ({
          data: channelId,
          label: String(label),
        }));
        setGuilds(nextGuilds);
        if (nextGuilds.length > 0) {
          setGuild(nextGuilds[0].data);
        }
      });
  }, []);

  useEffect(() => {
    call<[], Record<string, any>>("get_voice_channels", selectedGuild)
    .then(res => {
        if (!res || "error" in res)
          return;

        const voiceOptions: DropdownOption[] = Object.entries(res).map(([channelId, label]) => ({
          data: channelId,
          label: String(label),
        }));

        setChannels(voiceOptions);
    })
  }, [selectedGuild])

  return (
    <div>
      <span>
        <h3>{selectedChannel === undefined ? "No Active Voice" : selectedChannel}</h3>
        <DialogButton
          onClick={() => {
            call("disconnect_vc");
          }}
          style={{
            height: "40px",
            width: "40px",
            minWidth: 0,
            padding: "10px 12px",
            marginRight: "10px",
          }}
        >
          Leave Voice Channel
        </DialogButton>
      </span>
      <Dropdown
        menuLabel="Guilds"
        selectedOption={selectedGuild}
        rgOptions={guilds}
        onChange={(e: { data: any; }) => {
          setChannel(e.data);

          if (window.location.pathname == "/routes/discord") {
            window.DISCORD_TAB.m_browserView.SetVisible(true);
            window.DISCORD_TAB.m_browserView.SetFocus(true);
          }
        }}
        onMenuOpened={() => {
          window.DISCORD_TAB.m_browserView.SetVisible(false);
          window.DISCORD_TAB.m_browserView.SetFocus(false);
        }}
      ></Dropdown>
      <div>
        {renderVoiceChannels(selectedGuild, channels)}
      </div>
    </div>
  );
}

function renderVoiceChannels(guildId: string, voiceChannels: DropdownOption[]) {
  return voiceChannels.map((elem, i, arr) => {
    (
      <div>
        <span>
          <h4>{elem.label}</h4>
          {renderJoinButton(guildId, elem.data)}
        </span>
        <span>
          
        </span>
        </div>
    )
  })
}

function renderJoinButton(guildId: string, voiceId: string) {
  return (
    <DialogButton
      style={{ marginTop: "5px" }}
      onClick={() => {
        call("connect_vc", voiceId, guildId);
      }}
    >
      Join Voice
    </DialogButton>
  )
}
