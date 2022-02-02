import React, { FC } from "react";
import { Flex } from "@chakra-ui/react";
import { PageEntry } from "data/definitions";
import ContentPart from "../src/contentPart";

const Page: FC<PageEntry> = (props: PageEntry) => {
    return (
        <Flex direction="column" minH="100vh">
            {props.mainContent.map((cp) => (
                <ContentPart key={cp.id} {...cp} />
            ))}
        </Flex>
    );
};

export default Page;
