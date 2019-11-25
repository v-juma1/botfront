import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DynamicSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { debounce } from 'lodash';

export default function DataTable(props) {
    const {
        data,
        hasNextPage,
        loadMore,
        columns,
        onChangeInVisibleItems,
    } = props;
    const dataCount = hasNextPage ? data.length + 1 : data.length;
    const isDataLoaded = index => !hasNextPage || index < data.length;

    const Row = React.forwardRef((row, ref) => {
        const { index, style } = row;
        if (!isDataLoaded(index)) {
            return (
                <div ref={ref} className='row' style={style}>
                    Loading...
                </div>
            );
        }
        return (
            <div ref={ref} className='row' style={style} data-index={index}>
                {columns.map(c => (
                    <div key={`${c.key}-${index}`} className='item' style={c.style}>
                        {c.render
                            ? c.render({ index, datum: data[index] })
                            : data[index][c.key]
                        }
                    </div>
                ))}
            </div>
        );
    });

    const tableRef = useRef(null);
    const [correction, setCorrection] = useState();
    const tableOffsetTop = tableRef && tableRef.current
        ? tableRef.current.offsetTop
        : 0;

    const handleScroll = debounce((start, end) => {
        if (!onChangeInVisibleItems) return;
        const visibleData = Array(end - start + 1).fill()
            .map((_, i) => start + i)
            .map(i => data[i])
            .filter(d => d);
        onChangeInVisibleItems(visibleData);
    }, 500);

    useEffect(() => setCorrection(tableOffsetTop + 40), [tableOffsetTop]);

    return (
        <div
            className='virtual-table'
            ref={tableRef}
            style={{ height: `calc(100vh - ${correction}px)` }}
        >
            <div className='header row'>
                {columns.map(c => (
                    <div key={`${c.key}-header`} className='item' style={c.style}>
                        {c.header}
                    </div>
                ))}
            </div>
            <AutoSizer>
                {({ height, width }) => (
                    <InfiniteLoader
                        isItemLoaded={isDataLoaded}
                        itemCount={dataCount}
                        loadMoreItems={loadMore}
                    >
                        {({ onItemsRendered, ref }) => (
                            <List
                                height={height}
                                itemCount={dataCount}
                                onItemsRendered={(items) => {
                                    handleScroll(items.visibleStartIndex, items.visibleStopIndex);
                                    onItemsRendered(items);
                                }}
                                ref={ref}
                                width={width}
                            >
                                {Row}
                            </List>
                        )}
                    </InfiniteLoader>
                )}
            </AutoSizer>
        </div>
    );
}

DataTable.propTypes = {
    hasNextPage: PropTypes.bool,
    data: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    loadMore: PropTypes.func,
    onChangeInVisibleItems: PropTypes.func,
};

DataTable.defaultProps = {
    hasNextPage: false,
    loadMore: () => {},
    onChangeInVisibleItems: null,
};
