
import '@mantine/carousel/styles.css';
import { Carousel } from '@mantine/carousel';
import { ActionIcon, Box, Button, Group, Image, Menu, Tooltip, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconArrowBack, IconEye, IconPhotoX, IconStarFilled, IconTrash, IconPlus } from '@tabler/icons-react';
import classes from './ImageCarousel.module.css'
import { InputImages } from '.';
import { useImages } from './hooks/useImages';
import { uniqueKey } from '../../utils';

interface ImageCarouselInterface {
    images: string[] | undefined
    action: Function
    open: boolean
    hasChanged: boolean
    buttonLocation?: 'below' | 'inline'
    hideMenu?: boolean
    hideInput?: boolean
    hideActions?: boolean
    withIndicators?: boolean
    withControls?: boolean
    mb?: any
    mt?: any
    ml?: any
    w?: any
}

export function ImageCarousel({
    images,
    action,
    hasChanged,
    open,
    buttonLocation = 'below',
    mb = 0,
    mt = 0,
    ml = 0,
    w = 200,
    hideMenu = false,
    hideInput = false,
    hideActions = false,
    withIndicators = true,
    withControls = true,
}: ImageCarouselInterface) {
    const theme = useMantineTheme();
    const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
    const { imageAction } = useImages((e) => console.log(e))
    if (images === undefined) return null;

    const theSelection = (theAction: any) => {
        imageAction(theAction);
        action(theAction);
    };

    const slides = images.map((image, idx: number) => (
        <Carousel.Slide key={`${uniqueKey()}image`}>
            <Box w={w} pos="relative" mt="xs">
                <Menu shadow="md" width={w} trigger="click" openDelay={100} closeDelay={0} closeOnItemClick>
                    <Menu.Target>
                        <Tooltip label='Tip: You can activate Magnify by hovering over an image and pressing Ctrl twice.'>
                            <Image src={image} w={w} fallbackSrc={'https://hfhtdev.blob.core.windows.net/production/brokenImage.jpg'} />
                        </Tooltip>
                    </Menu.Target>
                    {!hideMenu && (
                        <Menu.Dropdown>
                            <Menu.Label>Actions...</Menu.Label>
                            <div onClick={() => theSelection({ cmd: 'Favorite', url: image })}>
                                <Menu.Item leftSection={<IconEye style={{ width: '1rem', height: '1rem' }} />}>
                                    Favorite
                                </Menu.Item>
                            </div>
                            {/* <div onClick={() => theSelection({ cmd: 'View', url: image })}>
                                <Menu.Item leftSection={<IconEye style={{ width: '1rem', height: '1rem' }} />}>
                                    View
                                </Menu.Item>
                            </div> */}
                            <div onClick={() => theSelection({ cmd: 'Delete', url: image, idx })}>
                                <Menu.Item leftSection={<IconPhotoX style={{ width: '1rem', height: '1rem' }} />}>
                                    Remove
                                </Menu.Item>
                            </div>
                        </Menu.Dropdown>
                    )}
                </Menu>
                {!hideActions && (
                    <Group justify="space-between" gap="xs">
                        <Tooltip label="Favorite">
                            <ActionIcon variant="subtle" color="yellow" onClick={() => console.log('fav')}>
                                <IconStarFilled />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete">
                            <ActionIcon variant="subtle" color="gray" onClick={() => console.log('trash')}>
                                <IconTrash />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                )}
            </Box>
        </Carousel.Slide>
    ));

    // INLINE: Add button as a slide
    if (!hideInput && buttonLocation === 'inline') {
        slides.push(
            <Carousel.Slide key="add-image-slide">
                <Box w={w} h="100%" display="flex" style={{ justifyContent: "center", alignItems: "center" }}>
                    <InputImages
                        images={images}
                        setImages={(e: any) => theSelection({ cmd: 'Add', img: e, idx: images.length })}
                        mode="donation"
                    // inline // you might want to pass an 'inline' prop so InputImages renders as a button/icon
                    />
                </Box>
            </Carousel.Slide>
        );
    }

    return (
        <>
            <Carousel
                mt={mt}
                mb={mb}
                ml={ml}
                slideSize={{ base: '50%', sm: '20%' }}
                slideGap={{ base: 'xl', sm: 2 }}
                controlsOffset="lg"
                controlSize={37}
                withControls={withControls}
                withIndicators={withIndicators}
                classNames={classes}
                emblaOptions={{ align: 'start', slidesToScroll: mobile ? 1 : 2 }}
            >
                {slides}
            </Carousel>
            {/* BELOW: Add button below */}
            {!hideInput && buttonLocation === 'below' && (
                <Box mt="sm">
                    <InputImages
                        images={images}
                        setImages={(e: any) => theSelection({ cmd: 'Add', img: e, idx: images.length })}
                        mode="donation"
                    />
                </Box>
            )}
            {hasChanged && !hideInput && (
                <Button
                    variant="light"
                    ml="sm"
                    size="sm"
                    leftSection={<IconArrowBack style={{ width: '1rem', height: '1rem' }} />}
                    onClick={() => theSelection({ cmd: 'Reset' })}
                >
                    Undo
                </Button>
            )}
        </>
    );
}