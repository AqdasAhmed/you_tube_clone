import React from 'react'
import Leftsidebar from '../../Component/Leftsidebar/Leftsidebar'
import Showvideogrid from '../../Component/Showvideogrid/Showvideogrid'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
const Search = () => {
    const { searchquery } = useParams();
    const vids = useSelector(s => s?.videoreducer?.data || [])
        .filter(q => q?.videotitle?.toUpperCase().includes(searchquery?.toUpperCase() || ''))
    return (
        <div className="container_Pages_App">
            <Leftsidebar />
            <div className="container2_Pages_App">
                {vids.length > 0 ? (
                    <Showvideogrid vid={vids} />
                ) : (
                    <p>No videos found for "{searchquery}"</p>
                )}
            </div>
        </div>
    )
}

export default Search
