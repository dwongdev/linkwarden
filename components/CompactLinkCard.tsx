import {
  CollectionIncludingMembersAndLinkCount,
  LinkIncludingShortenedCollectionAndTags,
} from "@/types/global";
import { faFolder, faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import Image from "next/image";
import Dropdown from "./Dropdown";
import useLinkStore from "@/store/links";
import useCollectionStore from "@/store/collections";
import useAccountStore from "@/store/account";
import useModalStore from "@/store/modals";

type Props = {
  link: LinkIncludingShortenedCollectionAndTags;
  count: number;
  className?: string;
};

export default function LinkCard({ link, count, className }: Props) {
  const { setModal } = useModalStore();

  const [expandDropdown, setExpandDropdown] = useState(false);

  const { collections } = useCollectionStore();

  const { account } = useAccountStore();

  const [collection, setCollection] =
    useState<CollectionIncludingMembersAndLinkCount>(
      collections.find(
        (e) => e.id === link.collection.id
      ) as CollectionIncludingMembersAndLinkCount
    );

  useEffect(() => {
    setCollection(
      collections.find(
        (e) => e.id === link.collection.id
      ) as CollectionIncludingMembersAndLinkCount
    );
  }, [collections]);

  const { removeLink, updateLink } = useLinkStore();

  const url = new URL(link.url);
  const formattedDate = new Date(link.createdAt as string).toLocaleString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  return (
    <div
      className={`bg-gradient-to-tr from-slate-200 from-10% to-gray-50 via-20% shadow-sm hover:shadow-none cursor-pointer duration-100 p-5 rounded-3xl relative group ${className}`}
    >
      <div
        onClick={() => setExpandDropdown(!expandDropdown)}
        id={"expand-dropdown" + link.id}
        className="text-gray-500 inline-flex rounded-md cursor-pointer hover:bg-slate-200 absolute right-5 top-5 z-10 duration-100 p-1"
      >
        <FontAwesomeIcon
          icon={faEllipsis}
          title="More"
          className="w-5 h-5"
          id={"expand-dropdown" + link.id}
        />
      </div>

      <div
        onClick={() => console.log("hi!")}
        className="flex items-start gap-5 sm:gap-10 h-full w-full"
      >
        <Image
          src={`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url.origin}&size=32`}
          width={70}
          height={70}
          alt=""
          className="blur-sm absolute bottom-5 right-5 opacity-60 group-hover:opacity-80 duration-100 select-none"
          draggable="false"
          onError={(e) => {
            const target = e.target as HTMLElement;
            target.style.opacity = "0";
          }}
        />

        <div className="flex justify-between gap-5 w-full h-full z-0">
          <div className="flex flex-col justify-between w-full">
            <div className="flex items-baseline gap-1">
              <p className="text-sm text-sky-400 font-bold">{count + 1}.</p>
              <p className="text-lg text-sky-500 font-bold truncate max-w-[10rem]">
                {link.name}
              </p>
            </div>
            <div className="flex gap-3 items-center flex-wrap my-3">
              <div className="flex items-center gap-1">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="w-4 h-4 mt-1 drop-shadow"
                  style={{ color: collection?.color }}
                />
                <p className="text-sky-900 truncate max-w-[10rem]">
                  {collection?.name}
                </p>
              </div>
            </div>
            <p className="text-gray-500">{formattedDate}</p>
          </div>
        </div>
      </div>
      {expandDropdown ? (
        <Dropdown
          items={[
            {
              name:
                link?.pinnedBy && link.pinnedBy[0]
                  ? "Unpin"
                  : "Pin to Dashboard",
              onClick: () => {
                updateLink({
                  ...link,
                  pinnedBy:
                    link?.pinnedBy && link.pinnedBy[0]
                      ? undefined
                      : [{ id: account.id }],
                });
                setExpandDropdown(false);
              },
            },
            {
              name: "Edit",
              onClick: () => {
                setModal({
                  modal: "LINK",
                  state: true,
                  method: "UPDATE",
                  active: link,
                });
                setExpandDropdown(false);
              },
            },
            {
              name: "Delete",
              onClick: () => {
                removeLink(link);
                setExpandDropdown(false);
              },
            },
          ]}
          onClickOutside={(e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target.id !== "expand-dropdown" + link.id)
              setExpandDropdown(false);
          }}
          className="absolute top-12 right-5 w-36"
        />
      ) : null}
    </div>
  );
}
