import { call } from "@decky/api";
import { DialogButton, Dropdown, DropdownOption } from "@decky/ui";
import { useEffect, useState } from "react";

export function VoiceChannels() {
  const [selectedChannel, setChannel] = useState<any>();
  const [channels, setChannels] = useState<DropdownOption[]>([]);
  const [selectedGuild, setGuild] = useState<any>();
  const [guilds, setGuilds] = useState<DropdownOption[]>([]);

  useEffect(() => {
    call<[], Record<string, any>>("get_guilds")
      .then(res => {
        console.log("Pulling guild information");
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

        console.log("Guild Info", nextGuilds);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    call<[], Record<string, any>>("get_voice_channels", selectedGuild)
    .then(res => {
        console.log("Pulling Voice Channel information");
        if (!res || "error" in res)
          return;

        const voiceOptions: DropdownOption[] = Object.entries(res).map(([channelId, label]) => ({
          data: channelId,
          label: String(label),
        }));

        setChannels(voiceOptions);
        console.log("Voice Info", voiceOptions);
    })
    .catch(err => {
      console.error(err);
    });
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
            width: "120px",
            minWidth: 0,
            padding: "10px 12px",
            marginRight: "10px",
          }}
        >
          Disconnect
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
