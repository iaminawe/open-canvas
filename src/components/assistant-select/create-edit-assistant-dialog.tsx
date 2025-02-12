import { CreateAssistantFields } from "@/hooks/useAssistants";
import { Assistant } from "@langchain/langgraph-sdk";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import * as Icons from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { TighterText } from "../ui/header";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { IconSelect } from "./icon-select";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { ColorPicker } from "./color-picker";
import { Textarea } from "../ui/textarea";
import { InlineContextTooltip } from "../ui/inline-context-tooltip";
import { fetchIndexes } from "@/lib/pinecone"; // Import Pinecone utility

interface CreateEditAssistantDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  userId: string | undefined;
  isEditing: boolean;
  assistant?: Assistant;
  createCustomAssistant: (
    newAssistant: CreateAssistantFields,
    userId: string,
    successCallback?: (id: string) => void
  ) => Promise<boolean>;
  editCustomAssistant: (
    editedAssistant: CreateAssistantFields,
    assistantId: string,
    userId: string
  ) => Promise<Assistant | undefined>;
  isLoading: boolean;
  allDisabled: boolean;
  setAllDisabled: Dispatch<SetStateAction<boolean>>;
}

const GH_DISCUSSION_URL = `https://github.com/langchain-ai/open-canvas/discussions/182`;

const SystemPromptWhatsThis = (): React.ReactNode => (
  <span className="flex flex-col gap-1 text-sm text-gray-600">
    <p>
      Custom system prompts will be passed to the LLM when generating, or
      re-writing artifacts. They are <i>not</i> used for responding to general
      queries in the chat, highlight to edit, or quick actions.
    </p>
    <p>
      We&apos;re looking for feedback on how to best handle customizing
      assistant prompts. To vote, and give feedback please visit{" "}
      <a href={GH_DISCUSSION_URL} target="_blank">
        this GitHub discussion
      </a>
      .
    </p>
  </span>
);

export function CreateEditAssistantDialog(
  props: CreateEditAssistantDialogProps
) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [iconName, setIconName] = useState<keyof typeof Icons>("User");
  const [hasSelectedIcon, setHasSelectedIcon] = useState(false);
  const [iconColor, setIconColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);

  // Pinecone Index State
  const [pineconeIndex, setPineconeIndex] = useState("");
  const [availableIndexes, setAvailableIndexes] = useState<string[]>([]);

  const metadata = props.assistant?.metadata as Record<string, any> | undefined;

  useEffect(() => {
    if ((props.assistant, props.isEditing)) {
      setName(props.assistant?.name || "");
      setDescription(metadata?.description || "");
      setSystemPrompt(
        (props.assistant?.config?.configurable?.systemPrompt as
          | string
          | undefined) || ""
      );
      setHasSelectedIcon(true);
      setIconName(metadata?.iconData?.iconName || "User");
      setIconColor(metadata?.iconData?.iconColor || "#000000");
      setPineconeIndex(
        metadata?.pineconeIndex || "" // Load Pinecone index if editing
      );
    } else if (!props.isEditing) {
      setName("");
      setDescription("");
      setSystemPrompt("");
      setIconName("User");
      setIconColor("#000000");
      setPineconeIndex(""); // Reset Pinecone index
    }
  }, [props.assistant, props.isEditing]);

  useEffect(() => {
    async function loadIndexes() {
      try {
        const indexes = await fetchIndexes();
        setAvailableIndexes(indexes);
      } catch (error) {
        console.error("Failed to fetch Pinecone indexes:", error);
      }
    }
    loadIndexes();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!props.userId) {
      toast({
        title: "User not found",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    if (props.isEditing && !props.assistant) {
      toast({
        title: "Assistant not found",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    props.setAllDisabled(true);

    let res: boolean;
    const assistantFields: CreateAssistantFields = {
      name,
      description,
      systemPrompt,
      iconData: {
        iconName,
        iconColor,
      },
      metadata: {
        pineconeIndex, // Include Pinecone index in metadata
      },
    };

    if (props.isEditing && props.assistant) {
      res = !!(await props.editCustomAssistant(
        assistantFields,
        props.assistant.assistant_id,
        props.userId
      ));
    } else {
      res = await props.createCustomAssistant(
        assistantFields,
        props.userId
      );
    }

    if (res) {
      toast({
        title: `Assistant ${props.isEditing ? "edited" : "created"} successfully`,
        duration: 5000,
      });
    } else {
      toast({
        title: `Failed to ${props.isEditing ? "edit" : "create"} assistant`,
        variant: "destructive",
        duration: 5000,
      });
    }
    props.setAllDisabled(false);
    props.setOpen(false);
  };

  const handleResetState = () => {
    setName("");
    setDescription("");
    setSystemPrompt("");
    setIconName("User");
    setIconColor("#000000");
    setPineconeIndex("");
  };

  if (props.isEditing && !props.assistant) {
    return null;
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={(change) => {
        if (!change) {
          handleResetState();
        }
        props.setOpen(change);
      }}
    >
      <DialogContent className="max-w-xl max-h-[90vh] p-8 bg-white rounded-lg shadow-xl min-w-[70vw] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <DialogHeader>
          <DialogTitle className="text-3xl font-light text-gray-800">
            <TighterText>
              {props.isEditing ? "Edit" : "Create"} Assistant
            </TighterText>
          </DialogTitle>
          <DialogDescription className="mt-2 text-md font-light text-gray-600">
            <TighterText>
              Creating a new assistant allows you to tailor your reflections to
              a specific context, as reflections are unique to assistants.
            </TighterText>
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => handleSubmit(e)}
          className="flex flex-col items-start justify-start gap-4 w-full"
        >
          <Label htmlFor="name">
            <TighterText>
              Name <span className="text-red-500">*</span>
            </TighterText>
          </Label>
          <Input
            disabled={props.allDisabled}
            required
            id="name"
            placeholder="Work Emails"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Label htmlFor="description">
            <TighterText>Description</TighterText>
          </Label>
          <Input
            disabled={props.allDisabled}
            required={false}
            id="description"
            placeholder="Assistant for my work emails"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Label htmlFor="system-prompt">
            <TighterText className="flex items-center">
              System Prompt
              <InlineContextTooltip cardContentClassName="w-[500px] ml-10">
                <SystemPromptWhatsThis />
              </InlineContextTooltip>
            </TighterText>
          </Label>
          <Textarea
            disabled={props.allDisabled}
            required={false}
            id="system-prompt"
            placeholder="You are an expert email assistant..."
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={5}
          />

          <Label htmlFor="pinecone-index">
            <TighterText>Pinecone Index (optional)</TighterText>
          </Label>
          <select
            disabled={props.allDisabled}
            id="pinecone-index"
            value={pineconeIndex}
            onChange={(e) => setPineconeIndex(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select Index</option>
            {availableIndexes.map((index) => (
              <option key={index} value={index}>
                {index}
              </option>
            ))}
          </select>

          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex flex-col gap-4 items-start justify-start w-full">
              <Label htmlFor="icon">
                <TighterText>Icon</TighterText>
              </Label>
              <IconSelect
                allDisabled={props.allDisabled}
                iconColor={iconColor}
                selectedIcon={iconName}
                setSelectedIcon={(i) => {
                  setHasSelectedIcon(true);
                  setIconName(i);
                }}
                hasSelectedIcon={hasSelectedIcon}
              />
            </div>
            <div className="flex flex-col gap-4 items-start justify-start w-full">
              <Label htmlFor="description">
                <TighterText>Color</TighterText>
              </Label>
              <div className="flex gap-1 items-center justify-start w-full">
                <ColorPicker
                  disabled={props.allDisabled}
                  iconColor={iconColor}
                  setIconColor={setIconColor}
                  showColorPicker={showColorPicker}
                  setShowColorPicker={setShowColorPicker}
                  hoverTimer={hoverTimer}
                  setHoverTimer={setHoverTimer}
                />
                <Input
                  disabled={props.allDisabled}
                  required={false}
                  id="description"
                  placeholder="Assistant for my work emails"
                  value={iconColor}
                  onChange={(e) => {
                    if (!e.target.value.startsWith("#")) {
                      setIconColor("#" + e.target.value);
                    } else {
                      setIconColor(e.target.value);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center w-full mt-4 gap-3">
            <Button
              disabled={props.allDisabled}
              className="w-full"
              type="submit"
            >
              <TighterText>Save</TighterText>
            </Button>
            <Button
              disabled={props.allDisabled}
              onClick={() => {
                handleResetState();
                props.setOpen(false);
              }}
              variant="destructive"
              className="w-[20%]"
              type="button"
            >
              <TighterText>Cancel</TighterText>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
